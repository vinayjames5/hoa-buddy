import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// const pdfPath = "data/hoa/Covenants and Restrictions.pdf";
const pdfPath = "data/hoa/ocr/Covenants and Restrictions OCR Forced.pdf";


const loader = new PDFLoader(pdfPath, {
  splitPages: true,
});

const documents = await loader.load();

console.log(`Loaded PDF: ${pdfPath}`);
console.log(`Pages loaded: ${documents.length}`);

console.log("\nPage text length summary:");

for (const document of documents) {
  const pageNumber = document.metadata.loc?.pageNumber;
  const characterCount = document.pageContent.length;

  console.log(`Page ${pageNumber}: ${characterCount} characters`);
}

const pagesToPreview = [1, 2, 3, 4, 5, 10];

for (const pageNumber of pagesToPreview) {
  const document = documents.find(
    (item) => item.metadata.loc?.pageNumber === pageNumber,
  );

  if (!document) {
    continue;
  }

  console.log(`\n--- Page ${pageNumber} Preview ---`);
  console.log(document.pageContent.slice(0, 1200));
}