import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  SCRAPER_PROXY_URL: z.string().url().optional().or(z.literal("")),
  SCRAPER_PROXY_KEY: z.string().optional().or(z.literal("")),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export const env: AppEnv = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  SCRAPER_PROXY_URL: process.env.SCRAPER_PROXY_URL,
  SCRAPER_PROXY_KEY:
    process.env.SCRAPER_PROXY_KEY || process.env.SCRAPING_API_KEY,
});

