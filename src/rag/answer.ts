import { askQuestion } from "./rag-service.js";

const defaultQuestion = "What is an Improvement?";
const question = process.argv.slice(2).join(" ") || defaultQuestion;

const result = await askQuestion(question);

console.log("QUESTION:");
console.log(result.question);
console.log("\nANSWER:");
console.log(result.answer);
console.log("\nSOURCES RETRIEVED:");

for (const source of result.sources) {
  console.log(
    `${source.sourceNumber}. ${source.document}, ${source.locator}, score ${source.score.toFixed(
      6,
    )}`,
  );
}
