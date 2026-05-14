import { z } from "zod";

export const DEFAULT_BASE_URL = "https://app.revroute.ru/api";
export const DEFAULT_HTTP_HOST = "127.0.0.1";
export const DEFAULT_HTTP_PORT = 8787;

const envSchema = z.object({
  REVROUTE_API_KEY: z.string().trim().min(1).optional(),
  REVROUTE_API_BASE_URL: z
    .string()
    .trim()
    .url()
    .default(DEFAULT_BASE_URL),
  REVROUTE_ENABLE_PARTNERS: z
    .union([z.literal("0"), z.literal("1"), z.literal("true"), z.literal("false")])
    .default("0"),
  REVROUTE_DEBUG: z
    .union([z.literal("0"), z.literal("1"), z.literal("true"), z.literal("false")])
    .default("0"),
  REVROUTE_HTTP_HOST: z.string().trim().min(1).default(DEFAULT_HTTP_HOST),
  REVROUTE_HTTP_PORT: z.coerce.number().int().min(1).max(65535).default(DEFAULT_HTTP_PORT),
  REVROUTE_CORS_ORIGIN: z.string().trim().min(1).default("*"),
});

export type RawEnv = z.infer<typeof envSchema>;

export interface ResolvedConfig {
  apiKey?: string;
  baseUrl: string;
  enablePartners: boolean;
  debug: boolean;
  http: {
    host: string;
    port: number;
    corsOrigin: string;
  };
}

const truthy = (v: string) => v === "1" || v === "true";

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ResolvedConfig {
  const parsed = envSchema.parse({
    REVROUTE_API_KEY: env.REVROUTE_API_KEY,
    REVROUTE_API_BASE_URL: env.REVROUTE_API_BASE_URL ?? DEFAULT_BASE_URL,
    REVROUTE_ENABLE_PARTNERS: env.REVROUTE_ENABLE_PARTNERS ?? "0",
    REVROUTE_DEBUG: env.REVROUTE_DEBUG ?? "0",
    REVROUTE_HTTP_HOST: env.REVROUTE_HTTP_HOST ?? DEFAULT_HTTP_HOST,
    REVROUTE_HTTP_PORT: env.REVROUTE_HTTP_PORT ?? String(DEFAULT_HTTP_PORT),
    REVROUTE_CORS_ORIGIN: env.REVROUTE_CORS_ORIGIN ?? "*",
  });

  return {
    apiKey: parsed.REVROUTE_API_KEY,
    baseUrl: parsed.REVROUTE_API_BASE_URL.replace(/\/+$/, ""),
    enablePartners: truthy(parsed.REVROUTE_ENABLE_PARTNERS),
    debug: truthy(parsed.REVROUTE_DEBUG),
    http: {
      host: parsed.REVROUTE_HTTP_HOST,
      port: parsed.REVROUTE_HTTP_PORT,
      corsOrigin: parsed.REVROUTE_CORS_ORIGIN,
    },
  };
}
