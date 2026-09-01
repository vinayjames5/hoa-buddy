import { Pinecone } from "@pinecone-database/pinecone";

import { env } from "./env.js";

export const createPineconeClient = (): Pinecone => {
  if (!env.pineconeApiKey) {
    throw new Error("Missing PINECONE_API_KEY. Add it to your .env file.");
  }

  return new Pinecone({
    apiKey: env.pineconeApiKey,
  });
};

export const getPineconeIndex = () => {
  const pinecone = createPineconeClient();
  return pinecone.index(env.pineconeIndexName);
};
