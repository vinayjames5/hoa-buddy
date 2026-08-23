import "dotenv/config";

type EnvConfig = {
  openAiApiKey: string | undefined;
  qdrantUrl: string;
  qdrantCollection: string;
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
  qdrantUrl: getRequiredEnv("QDRANT_URL"),
  qdrantCollection: getRequiredEnv("QDRANT_COLLECTION"),
};