import { PineconeStore } from "@langchain/pinecone";

import { createEmbeddings } from "../config/embeddings.js";
import { getPineconeIndex } from "../config/pinecone.js";
import type { HoaChunkMetadata } from "../models/document-metadata.js";

const namespace = "hoa";
const topK = 5;
const defaultQuestion = "What is an Improvement?";
const question = process.argv.slice(2).join(" ") || defaultQuestion;

const embeddings = createEmbeddings();
const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex: getPineconeIndex(),
  namespace,
});

const results = await vectorStore.similaritySearchWithScore(question, topK);

console.log("QUESTION:");
console.log(question);
console.log("\nRETRIEVED CHUNKS:");

for (const [index, [document, score]] of results.entries()) {
  const metadata = document.metadata as HoaChunkMetadata;

  console.log(`\n${index + 1}. ${metadata.document}`);
  console.log(`   Source type: ${metadata.sourceType}`);
  console.log(`   Jurisdiction: ${metadata.jurisdiction}`);
  console.log(`   Page: ${metadata.page}`);
  console.log(`   Score: ${score.toFixed(6)}`);
  console.log("   Text:");
  console.log(
    document.pageContent
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 700),
  );
}
