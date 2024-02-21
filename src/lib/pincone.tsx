import {
  PineconeClient,
  Vector,
  utils as PineconeUtils,
} from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";
import { convertToAscii } from "./utils";


export const getPineconeClient = async () => {
    const pinecone = new PineconeClient();
    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONN_API_KEY!,
    });
  return pinecone;
};


type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};



type JsonObject = { [key: string]: any };

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent, "text-embedding-ada-002");
    // give a id from pinecone
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as Vector;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}
export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");

  // split the data
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}

export async function loadS3IntoPinecone(fileKey: string) {
  try {
    // Obtain the pdf => download and read from pdf
    console.log("downloading s3 into file system");

    const file_name = await downloadFromS3(fileKey);
    console.log(file_name,"file_naME")

    if (!file_name) {
      throw new Error("could not download from s3");
    }

    const loader = new PDFLoader(file_name);
    const pages = (await loader.load()) as PDFPage[];


    // Initialize an empty array to store processed documents
    const processedDocuments: Document[][] = [];

    // Iterate over each PDFPage and process it sequentially
    for (const page of pages) {
      const documents = await prepareDocument(page);
      processedDocuments.push(documents);
    }

    // Flatten the array of arrays into a single array of documents
    const documents = processedDocuments.flat();
    
    // Initialize an empty array to store vectors
    const vectors: Vector[] = [];
    // Iterate over each document and embed it sequentially
    for (const document of documents) {
      const vector = await embedDocument(document);
      vectors.push(vector);
    }

    // Upload vectors into pineconedb
    const client = await getPineconeClient();
    const pineconeIndex = client.Index("chatpdf-file");
    const namespace = convertToAscii(fileKey);
    PineconeUtils.chunkedUpsert(pineconeIndex, vectors, namespace, 10);

    console.log("Vectors uploaded successfully");
  } catch (error) {
    console.error("Error loading S3 into Pinecone:", error);
    // Additional error handling and logging can be added here
  }
}


