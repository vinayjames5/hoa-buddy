import { PineconeStore } from "@langchain/pinecone";

import { createEmbeddings } from "../config/embeddings.js";
import { getPineconeIndex } from "../config/pinecone.js";
import type { HoaChunkMetadata } from "../models/document-metadata.js";

type RetrievalTestCase = {
  question: string;
  expectedTerms: string[];
};

const namespace = "hoa";
const topK = 5;

const testCases: RetrievalTestCase[] = [
  {
    question: "What is an Improvement?",
    expectedTerms: ["Improvement", "structures", "driveways"],
  },
  {
    question: "What is a Lot?",
    expectedTerms: ["Lot", "residence", "owned"],
  },
  {
    question: "How does an owner get approval for a proposed improvement?",
    expectedTerms: ["approval", "Committee", "application"],
  },
  {
    question: "Who is responsible for maintaining exterior improvements?",
    expectedTerms: ["maintenance", "Owner", "exterior"],
  },
  {
    question: "What does the declaration say about assessments?",
    expectedTerms: ["assessments", "Association", "Lot"],
  },
];

const normalize = (text: string): string => text.toLowerCase();

const hasExpectedTerms = (text: string, expectedTerms: string[]): boolean => {
  const normalizedText = normalize(text);
  return expectedTerms.every((term) => normalizedText.includes(normalize(term)));
};

const formatPreview = (text: string): string => {
  return text.replace(/\s+/g, " ").trim().slice(0, 400);
};

const embeddings = createEmbeddings();
const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex: getPineconeIndex(),
  namespace,
});

let topOneHits = 0;
let topFiveHits = 0;

for (const [testIndex, testCase] of testCases.entries()) {
  const results = await vectorStore.similaritySearchWithScore(
    testCase.question,
    topK,
  );

  const topOneHit = results[0]
    ? hasExpectedTerms(results[0][0].pageContent, testCase.expectedTerms)
    : false;
  const topFiveHit = results.some(([document]) =>
    hasExpectedTerms(document.pageContent, testCase.expectedTerms),
  );

  if (topOneHit) {
    topOneHits += 1;
  }

  if (topFiveHit) {
    topFiveHits += 1;
  }

  console.log(`\n=== Test ${testIndex + 1}: ${testCase.question} ===`);
  console.log(`Expected terms: ${testCase.expectedTerms.join(", ")}`);
  console.log(`Top-1 keyword hit: ${topOneHit ? "yes" : "no"}`);
  console.log(`Top-${topK} keyword hit: ${topFiveHit ? "yes" : "no"}`);

  for (const [resultIndex, [document, score]] of results.entries()) {
    const metadata = document.metadata as HoaChunkMetadata;

    console.log(`\n${resultIndex + 1}. ${metadata.document}`);
    console.log(`   Page: ${metadata.page}`);
    console.log(`   Score: ${score.toFixed(6)}`);
    console.log(`   Preview: ${formatPreview(document.pageContent)}`);
  }
}

console.log("\n=== Summary ===");
console.log(`Tests: ${testCases.length}`);
console.log(`Top-1 keyword hits: ${topOneHits}/${testCases.length}`);
console.log(`Top-${topK} keyword hits: ${topFiveHits}/${testCases.length}`);
