import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { cleanExtractedText } from "../utils/clean-text.js";

const pdfPath = "data/hoa/ocr/Covenants and Restrictions OCR Forced.pdf";

const loader = new PDFLoader(pdfPath, {
  splitPages: true,
});

const pages = await loader.load();

const cleanedPages = pages
  .map((page) => ({
    ...page,
    pageContent: cleanExtractedText(page.pageContent),
    metadata: {
      ...page.metadata,
      sourceType: "hoa",
      jurisdiction: "community",
      document: "Covenants and Restrictions",
    },
  }))
  .filter((page) => page.pageContent.length > 0);

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const chunks = await splitter.splitDocuments(cleanedPages);

console.log(`Loaded pages: ${pages.length}`);
console.log(`Cleaned non-empty pages: ${cleanedPages.length}`);
console.log(`Chunks created: ${chunks.length}`);

// const chunksToPreview = chunks.slice(0, 5);
const chunksToPreview = chunks
  .filter((chunk) => {
    const pageNumber = chunk.metadata.loc?.pageNumber;
    return pageNumber === 10 || pageNumber === 11;
  })
  .slice(0, 5);

for (const [index, chunk] of chunksToPreview.entries()) {
  console.log(`\n--- Chunk ${index + 1} ---`);
  console.log(`Characters: ${chunk.pageContent.length}`);
  console.log("Metadata:");
  console.log(JSON.stringify(chunk.metadata, null, 2));
  console.log("Text:");
  console.log(chunk.pageContent.slice(0, 1000));
}