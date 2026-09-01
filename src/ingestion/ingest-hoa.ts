import { PineconeStore } from "@langchain/pinecone";

import { createEmbeddings } from "../config/embeddings.js";
import { getPineconeIndex } from "../config/pinecone.js";
import { createHoaChunkIds, loadHoaChunks } from "./load-hoa-chunks.js";

const namespace = "hoa";

const chunks = await loadHoaChunks();
const ids = createHoaChunkIds(chunks);

console.log(`Loaded HOA chunks: ${chunks.length}`);
console.log(`Namespace: ${namespace}`);

const embeddings = createEmbeddings();
const pineconeIndex = getPineconeIndex();
const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex,
  namespace,
});

await vectorStore.addDocuments(chunks, {
  ids,
});

console.log(`Upserted HOA chunks into Pinecone: ${chunks.length}`);
