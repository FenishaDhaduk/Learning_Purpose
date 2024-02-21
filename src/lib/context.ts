import { PineconeClient } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  const pinecone = new PineconeClient();
  await pinecone.init({
    apiKey: process.env.PINECONN_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!,
  });

  const index = await pinecone.Index("chatpdf-file");
  try {
    const namespace = convertToAscii(fileKey);
    const queryResult = await index.query({
      queryRequest: {
        // it's return top 5 veactors result
        topK: 5,
        vector: embeddings,
        includeMetadata:true,
        namespace
      },
    });
    return queryResult.matches || []
  } catch (error) {
    console.log("error query in embedding", error);
  }
}


export async function getContext(query:string,fileKey:string) {
    const queryEmbeddings = await getEmbeddings(query,"text-embedding-ada-002")
    const matches = await getMatchesFromEmbeddings(queryEmbeddings,fileKey)

    const qualifyingDocs = matches?.filter((match) => match.score && match.score > 0.7)

    type Metadata = {
        text: string;
        pageNumber : number
    }

    let doc = qualifyingDocs?.map(match=>(match.metadata as Metadata).text)

    // 5 vectors

    return doc?.join("/n").substring(0,3000)
    
}   