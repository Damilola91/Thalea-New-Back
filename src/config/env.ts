import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4252),

  DB_URI: z.string().min(1, { message: "DB_URI is required" }),

  DEBUG_MODE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  FRONTEND_URL: z.url({ error: "FRONTEND_URL must be a valid URL" }),

  JWT_SECRET: z.string().min(1, { message: "JWT_SECRET is required" }),
  JWT_REFRESH_SECRET: z
    .string()
    .min(1, { message: "JWT_REFRESH_SECRET is required" }),

  STRIPE_SECRET_KEY: z
    .string()
    .min(1, { message: "STRIPE_SECRET_KEY is required" }),
  STRIPE_API_VERSION: z
    .string()
    .min(1, { message: "STRIPE_API_VERSION is required" }),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith("whsec_", {
      message: "STRIPE_WEBHOOK_SECRET must start with whsec_",
    }),
  STRIPE_TIMEOUT_MS: z.coerce.number().positive(),
  STRIPE_RETRY_MAX_ATTEMPTS: z.coerce.number().int().nonnegative(),
  STRIPE_RETRY_BASE_DELAY_MS: z.coerce.number().int().nonnegative(),

  SENDER_EMAIL: z.email({ error: "SENDER_EMAIL must be a valid email" }),
  EMAIL_PASS: z.string().min(1, { message: "EMAIL_PASS is required" }),
  EMAIL_TIMEOUT_MS: z.coerce.number().positive(),
  EMAIL_RETRY_MAX_ATTEMPTS: z.coerce.number().int().nonnegative(),
  EMAIL_RETRY_BASE_DELAY_MS: z.coerce.number().int().nonnegative(),

  CLOUDINARY_API_KEY: z
    .string()
    .min(1, { message: "CLOUDINARY_API_KEY is required" }),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(1, { message: "CLOUDINARY_API_SECRET is required" }),
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, { message: "CLOUDINARY_CLOUD_NAME is required" }),

  LODGIFY_API_KEY: z
    .string()
    .min(1, { message: "LODGIFY_API_KEY is required" }),
  LODGIFY_PROPERTY_ID: z
    .string()
    .min(1, { message: "LODGIFY_PROPERTY_ID is required" }),
  LODGIFY_ROOM_TYPE_ID: z
    .string()
    .min(1, { message: "LODGIFY_ROOM_TYPE_ID is required" }),

  SERVICE_NAME: z.string().min(1).default("thalea-new-back"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:");
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
