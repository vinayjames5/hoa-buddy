import { getPineconeIndex } from "../config/pinecone.js";

const index = getPineconeIndex();
const stats = await index.describeIndexStats();

console.log("Pinecone index stats:");
console.log(`Dimension: ${stats.dimension}`);
console.log(`Total record count: ${stats.totalRecordCount}`);

const namespaces = stats.namespaces ?? {};
const namespaceNames = Object.keys(namespaces);

console.log(`Namespaces: ${namespaceNames.length}`);

for (const namespace of namespaceNames) {
  const recordCount = namespaces[namespace]?.recordCount ?? 0;
  console.log(`- ${namespace}: ${recordCount}`);
}
