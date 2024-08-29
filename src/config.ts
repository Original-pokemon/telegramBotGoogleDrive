import "dotenv/config";
import z from "zod";

const configSchema = z.object({
  DATABASE_URL: z.string(),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"])
    .default("info"),
  NODE_ENV: z.enum(["development", "production"]),
  BOT_TOKEN: z.string(),
  MAIN_ADMIN_ID: z.coerce.string(),
  MAIN_FOLDER_ID: z.string(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string(),
});

const parseConfig = (environment: NodeJS.ProcessEnv) => {
  const config = configSchema.parse(environment);

  return {
    ...config,
    isDev: process.env.NODE_ENV === "development",
    isProd: process.env.NODE_ENV === "production",
  };
};

export type Config = ReturnType<typeof parseConfig>;

export const config = parseConfig(process.env);
