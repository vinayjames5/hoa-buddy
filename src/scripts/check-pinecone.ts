import { Pinecone } from "@pinecone-database/pinecone";

import { env } from "../config/env.js";

if (!env.pineconeApiKey) {
  throw new Error("Missing PINECONE_API_KEY. Add it to your .env file.");
}

const pinecone = new Pinecone({
  apiKey: env.pineconeApiKey,
});

const indexes = await pinecone.listIndexes();

console.log("Connected to Pinecone.");
console.log(`Indexes found: ${indexes.indexes?.length ?? 0}`);

for (const index of indexes.indexes ?? []) {
  console.log(`- ${index.name}`);
}