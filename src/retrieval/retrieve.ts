import { PineconeStore } from "@langchain/pinecone";

import { createEmbeddings } from "../config/embeddings.js";
import { getPineconeIndex } from "../config/pinecone.js";
import type { SourceChunkMetadata } from "../models/document-metadata.js";

const namespaces = ["hoa", "florida-law"] as const;
const topKPerNamespace = 5;
const defaultQuestion = "What is an Improvement?";
const question = process.argv.slice(2).join(" ") || defaultQuestion;

const embeddings = createEmbeddings();
const pineconeIndex = getPineconeIndex();
const namespaceResults = await Promise.all(
  namespaces.map(async (namespace) => {
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace,
    });

    const results = await vectorStore.similaritySearchWithScore(
      question,
      topKPerNamespace,
    );

    return {
      namespace,
      results,
    };
  }),
);

console.log("QUESTION:");
console.log(question);
console.log("\nRETRIEVED CHUNKS BY NAMESPACE:");

for (const namespaceResult of namespaceResults) {
  console.log(`\n=== ${namespaceResult.namespace} ===`);

  for (const [index, [document, score]] of namespaceResult.results.entries()) {
    const metadata = document.metadata as SourceChunkMetadata;

    console.log(`\n${index + 1}. ${metadata.document}`);
    console.log(`   Source type: ${metadata.sourceType}`);
    console.log(`   Jurisdiction: ${metadata.jurisdiction}`);

    if ("page" in metadata) {
      console.log(`   Page: ${metadata.page}`);
    }

    if ("section" in metadata) {
      console.log(`   Section: ${metadata.section}`);
      console.log(`   Title: ${metadata.title}`);
      console.log(`   URL: ${metadata.sourceUrl}`);
    }

    console.log(`   Score: ${score.toFixed(6)}`);
    console.log("   Text:");
    console.log(
      document.pageContent
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 700),
    );
  }
}
