import { env } from "../config/env.js";

type QdrantCollectionsResponse = {
  result: {
    collections: Array<{
      name: string;
    }>;
  };
  status: string;
  time: number;
};

const response = await fetch(`${env.qdrantUrl}/collections`);

if (!response.ok) {
  throw new Error(
    `Qdrant request failed with ${response.status} ${response.statusText}`,
  );
}

const data = (await response.json()) as QdrantCollectionsResponse;

console.log("Connected to Qdrant.");
console.log(`Status: ${data.status}`);
console.log(`Collections: ${data.result.collections.length}`);

for (const collection of data.result.collections) {
  console.log(`- ${collection.name}`);
}