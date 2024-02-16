import { Configuration, OpenAIApi, ResponseTypes } from "openai-edge"
import OpenAI from "openai";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

console.log(process.env.OPENAI_API_KEY,"apikey")

const openai = new OpenAI()

// this below function convert text into vector


export async function getEmbeddings(text:string) {

 try {
    const response = await openai.embeddings.create({
        model:'text-embedding-3-large',
        input:text.replace(/\n/g , " "),
        encoding_format: "float",
    })
    console.log(response.data[0].embedding,"78896563")
    return response.data[0].embedding as number[];
    
 } catch (error) {
    console.log("error calling openai embedings api")
    throw error
 }
    
}