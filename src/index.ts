import { env } from "./config/env.js";

console.log("HOA Buddy configuration loaded.");
console.log(`Qdrant URL: ${env.qdrantUrl}`);
console.log(`Qdrant collection: ${env.qdrantCollection}`);
console.log(`OpenAI API key configured: ${env.openAiApiKey ? "yes" : "no"}`);