import { Pinecone } from "@pinecone-database/pinecone";

import { env } from "../config/env.js";

const embeddingDimension = 1536;
const metric = "cosine";

if (!env.pineconeApiKey) {
  throw new Error("Missing PINECONE_API_KEY. Add it to your .env file.");
}

const pinecone = new Pinecone({
  apiKey: env.pineconeApiKey,
});

const existingIndexes = await pinecone.listIndexes();
const alreadyExists = existingIndexes.indexes?.some(
  (index) => index.name === env.pineconeIndexName,
);

if (alreadyExists) {
  console.log(`Pinecone index already exists: ${env.pineconeIndexName}`);
} else {
  console.log(`Creating Pinecone index: ${env.pineconeIndexName}`);

  await pinecone.createIndex({
    name: env.pineconeIndexName,
    dimension: embeddingDimension,
    metric,
    spec: {
      serverless: {
        cloud: env.pineconeCloud,
        region: env.pineconeRegion,
      },
    },
    waitUntilReady: true,
  });

  console.log("Pinecone index created.");
}

const description = await pinecone.describeIndex(env.pineconeIndexName);

console.log("\nIndex description:");
console.log(`Name: ${description.name}`);
console.log(`Dimension: ${description.dimension}`);
console.log(`Metric: ${description.metric}`);
console.log(`Host: ${description.host}`);
console.log(`Status: ${description.status?.state}`);
console.log(`Ready: ${description.status?.ready}`);