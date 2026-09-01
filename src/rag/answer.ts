import { ChatOpenAI } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

import { createEmbeddings } from "../config/embeddings.js";
import { env } from "../config/env.js";
import { getPineconeIndex } from "../config/pinecone.js";
import type { SourceChunkMetadata } from "../models/document-metadata.js";

const namespaces = ["hoa", "florida-law"] as const;
const topKPerNamespace = 4;
const defaultQuestion = "What is an Improvement?";
const question = process.argv.slice(2).join(" ") || defaultQuestion;

if (!env.openAiApiKey) {
  throw new Error("Missing OPENAI_API_KEY. Add it to your .env file.");
}

const embeddings = createEmbeddings();
const pineconeIndex = getPineconeIndex();
const retrieved = (
  await Promise.all(
    namespaces.map(async (namespace) => {
      const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace,
      });

      const results = await vectorStore.similaritySearchWithScore(
        question,
        topKPerNamespace,
      );

      return results.map(([document, score]) => ({
        namespace,
        document,
        score,
      }));
    }),
  )
).flat();

const context = retrieved
  .map(({ namespace, document, score }, index) => {
    const metadata = document.metadata as SourceChunkMetadata;
    const locator =
      "page" in metadata
        ? `Citation locator: page ${metadata.page}`
        : `Citation locator: Florida Statutes §${metadata.section}\nTitle: ${metadata.title}\nURL: ${metadata.sourceUrl}`;

    return [
      `[Source ${index + 1}]`,
      `Namespace: ${namespace}`,
      `Document: ${metadata.document}`,
      `Source type: ${metadata.sourceType}`,
      `Jurisdiction: ${metadata.jurisdiction}`,
      locator,
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
      "Cite each major claim using only the citation locator provided in the retrieved context.",
      "For HOA document sources, cite the source number and page.",
      "For Florida law sources, cite the source number and Florida Statutes section. Do not cite a page number for a Florida statute source.",
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

for (const [index, { document, score }] of retrieved.entries()) {
  const metadata = document.metadata as SourceChunkMetadata;
  const locator =
    "page" in metadata ? `page ${metadata.page}` : `section ${metadata.section}`;

  console.log(
    `${index + 1}. ${metadata.document}, ${locator}, score ${score.toFixed(
      6,
    )}`,
  );
}
