import { createEmbeddings, embeddingModel } from "../config/embeddings.js";

const embeddings = createEmbeddings();
const text = "Can I build a fence in my backyard?";

const vector = await embeddings.embedQuery(text);

console.log("Created test embedding.");
console.log(`Model: ${embeddingModel}`);
console.log(`Input: ${text}`);
console.log(`Dimensions: ${vector.length}`);
console.log(
  `First 8 values: ${vector
    .slice(0, 8)
    .map((value) => value.toFixed(6))
    .join(", ")}`,
);
