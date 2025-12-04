import { PrismaAdapter } from "@grammyjs/storage-prisma";
import { run, RunnerHandle } from "@grammyjs/runner";
import schedule from "node-schedule";
import googleRepository from "./google-drive/index.js";
import createBot from "./bot/index.js";
import dataBase from "./prisma/index.js";
import { config } from "./config.js";
import logger from "./logger.js";

function onShutdown(cleanUp: () => Promise<void>) {
  let isShuttingDown = false;
  const handleShutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    await cleanUp();
  };

  process.on("SIGINT", handleShutdown);
  process.on("SIGTERM", handleShutdown);
}

try {
  await dataBase.init();
  await googleRepository.init();

  const bot = await createBot(
    config.BOT_TOKEN,
    {
      config,
      logger,
      googleRepository,
    },
    {
      botSessionStorage: new PrismaAdapter(dataBase.client.session),
    },
  );

  let runner: undefined | RunnerHandle;

  onShutdown(async () => {
    logger.info("shutdown");

    await schedule.gracefulShutdown();
    await runner?.stop();
    await bot.stop();
    await dataBase.disconnect();
  });

  await Promise.all([bot.init()]);

  if (config.isProd) {
    logger.info({
      msg: "bot running...",
      username: bot.botInfo.username,
    });

    runner = run(bot);
  } else if (config.isDev) {
    await bot.start({
      onStart: ({ username }) =>
        logger.info({
          msg: "bot running...",
          username,
        }),
    });
  }
} catch (error) {
  logger.error(error);
  throw new Error("Error initializing bot");
}
