import { Bot as TelegramBot, BotConfig, GrammyError, HttpError, session, StorageAdapter } from 'grammy';
import pg from "pg";


import { autoRetry } from '@grammyjs/auto-retry';
import { hydrateFiles } from '@grammyjs/files';
import { run, sequentialize } from '@grammyjs/runner';
import { PsqlAdapter } from '@grammyjs/storage-psql';
import { apiThrottler } from '@grammyjs/transformer-throttler';
import { GoogleRepositoryType } from '../google-drive/index.js'

import { adminFeature } from './features/admin.js';
import authMiddleware from './middleware/auth.mw.js';
import GroupRepository from './repositories/group.repository.js';
import QuestionRepository from './repositories/question.repository.js';
import UsersRepository from './repositories/user.repository.js';
import { Config } from '../config.js';
import logger, { Logger } from '#root/logger.js';
import { Context, createContextConstructor, SessionData } from './context.js';
import PhotoFolderRepository from './repositories/photoFolder.js';
import { createConversationFeature } from './conversations/conversations.js';

interface Dependencies {
  config: Config
  logger: Logger
  googleRepository: GoogleRepositoryType
}

interface Options {
  botSessionStorage?: StorageAdapter<SessionData>
  botConfig?: Omit<BotConfig<Context>, 'ContextConstructor'>
}

function getSessionKey(ctx: Omit<Context, "session">) {
  return ctx.chat?.id.toString();
}


function createInitialSessionData(): SessionData {
  return {
    scene: '',
    isAdmin: false,
    user: Object.create(null),
    customData: {},
    answers: [],
    questions: [],
  };
}

export default async function createBot(token: string, dependencies: Dependencies, options: Options = {}) {
  const {
    config,
    logger,
    googleRepository
  } = dependencies

  const repositories = {
    users: new UsersRepository(),
    groups: new GroupRepository(),
    questions: new QuestionRepository(),
    photoFolders: new PhotoFolderRepository(),
    googleDrive: googleRepository
  }

  const bot = new TelegramBot(token, {
    ...options.botConfig,
    ContextConstructor: createContextConstructor({
      logger,
      repositories,
      config,
    }),
  })

  bot.api.config.use(apiThrottler());
  bot.api.config.use(hydrateFiles(bot.token));
  bot.api.config.use(
    autoRetry({
      maxRetryAttempts: 5, // only repeat requests once
      maxDelaySeconds: 5, // fail immediately if we have to wait >5 seconds
      retryOnInternalServerErrors: true,
    })
  );
  const conversationsFeature = createConversationFeature(repositories)

  bot.use(sequentialize(getSessionKey));

  bot.use(
    session({
      getSessionKey,
      initial: createInitialSessionData,
    })
  );

  bot.use(authMiddleware());
  bot.use(conversationsFeature)

  bot.use(adminFeature)

  bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }]);

  bot.catch((botError) => {
    const { ctx, error } = botError;
    logger.error(`Error while handling update ${ctx.update.update_id}:`);
    if (error instanceof GrammyError) {
      logger.error('Error in request:', error.description);
    } else if (error instanceof HttpError) {
      logger.error('Could not contact Telegram:', error);
    } else {
      logger.error('Unknown error:', error);
    }
  });

  const runner = run(bot);

  logger.info('Bot :>> Started');

  const stopRunner = () => {
    logger.info('Bot :>> Stoping...');
    return runner.isRunning() && runner.stop();
  };

  process.once('SIGINT', stopRunner);
  process.once('SIGTERM', stopRunner);
}
