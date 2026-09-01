import { OpenAIEmbeddings } from "@langchain/openai";

import { env } from "./env.js";

export const embeddingModel = "text-embedding-3-small";
export const embeddingDimension = 1536;

export const createEmbeddings = (): OpenAIEmbeddings => {
  if (!env.openAiApiKey) {
    throw new Error("Missing OPENAI_API_KEY. Add it to your .env file.");
  }

  return new OpenAIEmbeddings({
    apiKey: env.openAiApiKey,
    model: embeddingModel,
  });
};
