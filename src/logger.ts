import { pino } from "pino";
import { ecsFormat } from "@elastic/ecs-pino-format";
import path from "node:path";
import { promises as fs } from "node:fs";
import { config } from "./config.js";

const createLogger = async () => {
  if (config.NODE_ENV === "production") {
    const logDirectory = path.join(process.cwd(), "logs");
    const logFilePath = path.join(process.cwd(), "logs", "bot.log");

    try {
      await fs.access(logDirectory);
    } catch {
      await fs.mkdir(logDirectory, { recursive: true });
    }

    return pino(
      {
        level: config.LOG_LEVEL,
        ...ecsFormat(),
      },
      pino.destination(logFilePath),
    );
  }
  return pino({
    level: config.LOG_LEVEL,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  });
};

const logger = await createLogger();

export default logger

export type Logger = typeof logger;