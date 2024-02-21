import { Configuration, OpenAIApi } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

interface LastRequestTimes {
  [key: string]: number;
}

let lastRequestTimes: LastRequestTimes = {
  'text-embedding-3-small': 0,
  'text-embedding-ada-002': 0
};

const minTimeBetweenRequests = 20000; // 20 seconds in milliseconds

export async function getEmbeddings(text: string, model: string) {
  const currentTime = Date.now();
  const timeSinceLastRequest = currentTime - lastRequestTimes[model];

  if (timeSinceLastRequest < minTimeBetweenRequests) {
    const waitTime = minTimeBetweenRequests - timeSinceLastRequest;
    console.log(`Rate limit reached for ${model}. Waiting for ${waitTime / 1000} seconds before retrying.`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  try {
    const response = await openai.createEmbedding({
      model: model,
      input: text.replace(/\n/g, " "),
    });
    const result = await response.json();
    if (result && result.data && result.data.length > 0) {
      lastRequestTimes[model] = Date.now();
      return result.data[0].embedding as number[];
    } else {
      console.log("Unexpected response structure from OpenAI API");
      throw new Error("Unexpected response structure");
    }
  } catch (error) {
    console.log("Error calling OpenAI embeddings API:", error);
    throw error;
  }
}