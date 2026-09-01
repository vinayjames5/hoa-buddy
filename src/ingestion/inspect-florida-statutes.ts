import {
  loadFloridaStatuteChunks,
  loadFloridaStatuteSections,
} from "./load-florida-statutes.js";

const sections = await loadFloridaStatuteSections();

console.log("Loaded Florida Statutes Chapter 720 sections.");
console.log(`Sections: ${sections.length}`);

for (const section of sections.slice(0, 5)) {
  console.log(`\n${section.metadata.section} - ${section.metadata.title}`);
  console.log(`URL: ${section.metadata.sourceUrl}`);
  console.log(`Characters: ${section.pageContent.length}`);
  console.log(section.pageContent.slice(0, 500));
}

const chunks = await loadFloridaStatuteChunks();

console.log("\nChunk summary:");
console.log(`Chunks: ${chunks.length}`);

for (const chunk of chunks.slice(0, 3)) {
  console.log(
    `- ${chunk.metadata.section}, chunk ${chunk.metadata.chunkIndex}, ${chunk.pageContent.length} chars`,
  );
}
