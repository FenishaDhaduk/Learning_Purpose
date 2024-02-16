import { PineconeClient, Vector } from "pinecone-client";
import { Pinecone } from '@pinecone-database/pinecone';
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import md5 from "md5";
import { convertToAscii } from "./utils";


export const getPineconeClient = async () => {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONN_API_KEY ?? '',

  });
 
    
  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};



export async function loadS3IntoPinecone(fileKey: string) {
  try {
      // Download file from S3
      const fileName = await downloadFromS3(fileKey);
      if (!fileName) {
          throw new Error("Could not download file from S3");
      }

      // Load PDF pages and prepare documents
      const loader = new PDFLoader(fileName);
      const pages = await loader.load() as PDFPage[];
      const documents = await Promise.all(pages.map(prepareDocument));

      // Embed documents and create vectors
      const vectors = await Promise.all(documents.flat().map(embedDocument));

      // Check if the index exists
      const client = await getPineconeClient();
      const indexName = 'chatpdf-file';
      const indexExists = await client.indexExists(indexName);

      if (!indexExists) {
          // If index does not exist, handle it accordingly (create index or log an error)
          throw new Error(`Index '${indexName}' does not exist in Pinecone`);
      }

      // Upsert vectors into the index
      const index = client.index(indexName);
      await index.upsert(vectors);

      return { success: true };
  } catch (error) {
      console.error("Error loading S3 into Pinecone:", error);
      return { success: false, error: "Error loading S3 into Pinecone" };
  }
}


let lastRequestTime = Date.now();

// Define a function to wait for a specified duration
function wait(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export async function processPDF(fileKey: string) {
  // Ensure a minimum time gap between API requests
  const currentTime = Date.now();
  const timeDiff = currentTime - lastRequestTime;
  const minTimeGap = 20000; // 20 seconds
  if (timeDiff < minTimeGap) {
      await wait(minTimeGap - timeDiff);
  }

  // Update the last request time
  lastRequestTime = Date.now();

  try {
    const responce =   await loadS3IntoPinecone(fileKey);
      return responce;
  } catch (error) {
      console.error("Error processing PDF:", error);
      return { success: false, error: "Internal server error" };
  }
}


type JsonObject = { [key: string]: any };

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    // give a id from pinecone
    const hash = md5(doc.pageContent);

    const vector: Vector<JsonObject> = {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    };

    return vector;
  } catch (error) {
    console.log("error embedding document");
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