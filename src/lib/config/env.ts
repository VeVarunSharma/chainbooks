import { z } from "zod";

// Environment variable validation
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  ETHERSCAN_API_KEY: z.string().optional(),
  COINGECKO_API_KEY: z.string().optional(),
  AZURE_AI_ENDPOINT: z.string().url(),
  AZURE_AI_API_KEY: z.string().min(1),
  AZURE_AI_DEPLOYMENT: z.string().default("gpt-4o-mini"),
});

// Parse and validate environment variables
function getEnv() {
  // Return mock/default values in development if not set
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.warn(
      "⚠️  Environment variables not fully configured:",
      parsed.error.flatten().fieldErrors
    );
    // Return partial config for development
    return {
      DATABASE_URL: process.env.DATABASE_URL || "",
      ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY || "",
      COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || "",
      AZURE_AI_ENDPOINT: process.env.AZURE_AI_ENDPOINT || "",
      AZURE_AI_API_KEY: process.env.AZURE_AI_API_KEY || "",
      AZURE_AI_DEPLOYMENT: process.env.AZURE_AI_DEPLOYMENT || "gpt-4o-mini",
    };
  }

  return parsed.data;
}

export const env = getEnv();
