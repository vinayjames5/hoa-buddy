import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { cleanExtractedText } from "../utils/clean-text.js";
import type { HoaChunkMetadata } from "../models/document-metadata.js";

const hoaPdfPath = "data/hoa/ocr/Covenants and Restrictions OCR Forced.pdf";
const hoaDocumentName = "Covenants and Restrictions";
const chunkSize = 1000;
const chunkOverlap = 200;

const getPageNumber = (metadata: Record<string, unknown>): number => {
  const loc = metadata.loc;

  if (
    typeof loc === "object" &&
    loc !== null &&
    "pageNumber" in loc &&
    typeof loc.pageNumber === "number"
  ) {
    return loc.pageNumber;
  }

  return 0;
};

export const loadHoaChunks = async (): Promise<Document<HoaChunkMetadata>[]> => {
  const loader = new PDFLoader(hoaPdfPath, {
    splitPages: true,
  });

  const pages = await loader.load();
  const cleanedPages = pages
    .map((page) => {
      const pageNumber = getPageNumber(page.metadata);

      return new Document({
        pageContent: cleanExtractedText(page.pageContent),
        metadata: {
          sourceType: "hoa",
          jurisdiction: "community",
          document: hoaDocumentName,
          sourcePath: hoaPdfPath,
          page: pageNumber,
          chunkIndex: 0,
        },
      });
    })
    .filter((page) => page.pageContent.length > 0);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const chunks = await splitter.splitDocuments(cleanedPages);

  return chunks.map((chunk, chunkIndex) => {
    const metadata = chunk.metadata as HoaChunkMetadata;

    return new Document({
      pageContent: chunk.pageContent,
      metadata: {
        ...metadata,
        chunkIndex,
      },
    });
  });
};

export const createHoaChunkIds = (
  chunks: Document<HoaChunkMetadata>[],
): string[] => {
  return chunks.map((chunk) => {
    const page = String(chunk.metadata.page).padStart(3, "0");
    const chunkIndex = String(chunk.metadata.chunkIndex).padStart(4, "0");
    return `covenants-restrictions-p${page}-c${chunkIndex}`;
  });
};
