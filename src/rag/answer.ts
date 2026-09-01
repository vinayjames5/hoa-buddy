import { ChatOpenAI } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

import { createEmbeddings } from "../config/embeddings.js";
import { env } from "../config/env.js";
import { getPineconeIndex } from "../config/pinecone.js";
import type { HoaChunkMetadata } from "../models/document-metadata.js";

const namespace = "hoa";
const topK = 5;
const defaultQuestion = "What is an Improvement?";
const question = process.argv.slice(2).join(" ") || defaultQuestion;

if (!env.openAiApiKey) {
  throw new Error("Missing OPENAI_API_KEY. Add it to your .env file.");
}

const vectorStore = await PineconeStore.fromExistingIndex(createEmbeddings(), {
  pineconeIndex: getPineconeIndex(),
  namespace,
});

const retrieved = await vectorStore.similaritySearchWithScore(question, topK);

const context = retrieved
  .map(([document, score], index) => {
    const metadata = document.metadata as HoaChunkMetadata;

    return [
      `[Source ${index + 1}]`,
      `Document: ${metadata.document}`,
      `Source type: ${metadata.sourceType}`,
      `Jurisdiction: ${metadata.jurisdiction}`,
      `Page: ${metadata.page}`,
      `Retrieval score: ${score.toFixed(6)}`,
      "Text:",
      document.pageContent,
    ].join("\n");
  })
  .join("\n\n---\n\n");

const model = new ChatOpenAI({
  apiKey: env.openAiApiKey,
  model: "gpt-4o-mini",
  temperature: 0,
});

const response = await model.invoke([
  {
    role: "system",
    content: [
      "You are HOA Buddy, an informational assistant for homeowners.",
      "Answer only using the retrieved context provided by the user.",
      "Do not use outside knowledge to invent HOA rules, legal requirements, section numbers, page numbers, or citations.",
      "Clearly distinguish HOA rules from county, Florida, or federal law when those source types are present.",
      "If the retrieved context does not contain enough evidence, say: I could not find enough information in the available sources to answer this reliably.",
      "Cite the source number and page for each major claim.",
      "End with: This response is informational and is not legal advice.",
    ].join(" "),
  },
  {
    role: "user",
    content: [
      `Question: ${question}`,
      "",
      "Retrieved context:",
      context || "No context was retrieved.",
    ].join("\n"),
  },
]);

console.log("QUESTION:");
console.log(question);
console.log("\nANSWER:");
console.log(response.content);
console.log("\nSOURCES RETRIEVED:");

for (const [index, [document, score]] of retrieved.entries()) {
  const metadata = document.metadata as HoaChunkMetadata;

  console.log(
    `${index + 1}. ${metadata.document}, page ${metadata.page}, score ${score.toFixed(
      6,
    )}`,
  );
}
