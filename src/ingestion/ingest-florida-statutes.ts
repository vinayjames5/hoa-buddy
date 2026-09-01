import { PineconeStore } from "@langchain/pinecone";

import { createEmbeddings } from "../config/embeddings.js";
import { getPineconeIndex } from "../config/pinecone.js";
import {
  createFloridaStatuteChunkIds,
  loadFloridaStatuteChunks,
} from "./load-florida-statutes.js";

const namespace = "florida-law";

const chunks = await loadFloridaStatuteChunks();
const ids = createFloridaStatuteChunkIds(chunks);

console.log(`Loaded Florida Statutes Chapter 720 chunks: ${chunks.length}`);
console.log(`Namespace: ${namespace}`);

const vectorStore = await PineconeStore.fromExistingIndex(createEmbeddings(), {
  pineconeIndex: getPineconeIndex(),
  namespace,
});

await vectorStore.addDocuments(chunks, {
  ids,
});

console.log(`Upserted Florida statute chunks into Pinecone: ${chunks.length}`);
