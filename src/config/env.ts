import "dotenv/config";

type PineconeCloud = "aws";

type EnvConfig = {
  openAiApiKey: string | undefined;
  pineconeApiKey: string | undefined;
  pineconeIndexName: string;
  pineconeCloud: PineconeCloud;
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

const getPineconeCloud = (): PineconeCloud => {
  const value = getRequiredEnv("PINECONE_CLOUD");

  if (value !== "aws") {
    throw new Error(`Unsupported PINECONE_CLOUD: ${value}`);
  }

  return value;
};

export const env: EnvConfig = {
  openAiApiKey: getOptionalEnv("OPENAI_API_KEY"),
  pineconeApiKey: getOptionalEnv("PINECONE_API_KEY"),
  pineconeIndexName: getRequiredEnv("PINECONE_INDEX_NAME"),
  pineconeCloud: getPineconeCloud(),
  pineconeRegion: getRequiredEnv("PINECONE_REGION"),
};