import { ChatOpenAI } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";

import { createEmbeddings } from "../config/embeddings.js";
import { env } from "../config/env.js";
import { getPineconeIndex } from "../config/pinecone.js";
import type { SourceChunkMetadata } from "../models/document-metadata.js";
import { checkQuestionScope } from "./guardrails.js";

const namespaces = ["hoa", "florida-law"] as const;
const topKPerNamespace = 4;

export type RetrievedSource = {
  sourceNumber: number;
  document: string;
  sourceType: string;
  jurisdiction: string;
  locator: string;
  score: number;
  preview: string;
};

export type RagAnswer = {
  question: string;
  answer: string;
  sources: RetrievedSource[];
};

const getLocator = (metadata: SourceChunkMetadata): string => {
  if ("page" in metadata) {
    return `page ${metadata.page}`;
  }

  return `Florida Statutes §${metadata.section}`;
};

const formatPreview = (text: string): string => {
  return text.replace(/\s+/g, " ").trim().slice(0, 500);
};

export const askQuestion = async (question: string): Promise<RagAnswer> => {
  const scope = checkQuestionScope(question);

  if (!scope.inScope) {
    return {
      question,
      answer: scope.message,
      sources: [],
    };
  }

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

  return {
    question,
    answer:
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content),
    sources: retrieved.map(({ document, score }, index) => {
      const metadata = document.metadata as SourceChunkMetadata;

      return {
        sourceNumber: index + 1,
        document: metadata.document,
        sourceType: metadata.sourceType,
        jurisdiction: metadata.jurisdiction,
        locator: getLocator(metadata),
        score,
        preview: formatPreview(document.pageContent),
      };
    }),
  };
};
