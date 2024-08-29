import googleRepository from './google-drive/index.js';
import createBot from './bot/index.js';
import dataBase from './prisma/index.js';
import { config } from './config.js';
import logger from './logger.js';

await dataBase.init();
await googleRepository.init()
await createBot(config.BOT_TOKEN, {
  config,
  logger,
  googleRepository
});
