import "dotenv/config";

type EnvConfig = {
  openAiApiKey: string | undefined;
  pineconeApiKey: string | undefined;
  pineconeIndexName: string;
  pineconeCloud: string;
  pineconeRegion: string;
};

const getOptionalEnv = (name: string): string | undefined => {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
};

const getRequiredEnv = (name: string): string => {
  const value = getOptionalEnv(name);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env: EnvConfig = {
  openAiApiKey: getOptionalEnv("OPENAI_API_KEY"),
  pineconeApiKey: getOptionalEnv("PINECONE_API_KEY"),
  pineconeIndexName: getRequiredEnv("PINECONE_INDEX_NAME"),
  pineconeCloud: getRequiredEnv("PINECONE_CLOUD"),
  pineconeRegion: getRequiredEnv("PINECONE_REGION"),
};