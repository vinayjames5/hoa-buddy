import { env } from "./config/env.js";

console.log("HOA Buddy configuration loaded.");
console.log(`Pinecone index: ${env.pineconeIndexName}`);
console.log(`Pinecone cloud: ${env.pineconeCloud}`);
console.log(`Pinecone region: ${env.pineconeRegion}`);
console.log(`OpenAI API key configured: ${env.openAiApiKey ? "yes" : "no"}`);
console.log(`Pinecone API key configured: ${env.pineconeApiKey ? "yes" : "no"}`);