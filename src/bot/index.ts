import {
  Bot as TelegramBot,
  BotConfig,
  session,
  StorageAdapter,
  MemorySessionStorage,
} from "grammy";

import { autoRetry } from "@grammyjs/auto-retry";
import { hydrateFiles } from "@grammyjs/files";
import { sequentialize } from "@grammyjs/runner";
import { apiThrottler } from "@grammyjs/transformer-throttler";
import { Logger } from "#root/logger.js";
import { GoogleRepositoryType } from "../google-drive/index.js";

import { adminFeature } from "./features/admin.js";
import { createScheduleFeature } from "./features/schedule.js";
import { startFeature } from "./features/start.js";
import authMiddleware from "./middleware/auth.mw.js";
import GroupRepository from "./repositories/group.repository.js";
import QuestionRepository from "./repositories/question.repository.js";
import UsersRepository from "./repositories/user.repository.js";
import { Config } from "../config.js";
import {
  Context,
  createContextConstructor,
  ExternalSessionData,
  MemorySessionData,
} from "./context.js";
import PhotoFolderRepository from "./repositories/photoFolder.js";
import { questionSettingFeature } from "./features/question-setting.js";
import { createConversationFeature } from "./conversations/conversations.js";
import { userFeature } from "./features/user.js";
import { unhandledFeature } from "./features/unhandled.js";
import { errorHandler } from "./services/error.js";

interface Dependencies {
  config: Config;
  logger: Logger;
  googleRepository: GoogleRepositoryType;
}

interface Options {
  botSessionStorage: StorageAdapter<ExternalSessionData>;
  botConfig?: Omit<BotConfig<Context>, "ContextConstructor">;
}

function getSessionKey(ctx: Omit<Context, "session">) {
  return ctx.chat?.id.toString();
}

function createInitialExternalSessionData(): ExternalSessionData {
  return {
    scene: "",
    customData: {},
    answers: [],
    questions: [],
  };
}

const createInitialMemorySessionData = (): MemorySessionData => ({
  isAdmin: false,
  user: Object.create(null),
});

export default async function createBot(
  token: string,
  dependencies: Dependencies,
  options: Options,
) {
  const { config, logger, googleRepository } = dependencies;

  const repositories = {
    users: new UsersRepository(),
    groups: new GroupRepository(),
    questions: new QuestionRepository(),
    photoFolders: new PhotoFolderRepository(),
    googleDrive: googleRepository,
  };

  const bot = new TelegramBot(token, {
    ...options.botConfig,
    ContextConstructor: createContextConstructor({
      logger,
      repositories,
      config,
    }),
  });

  const protectedBot = bot.errorBoundary(errorHandler);

  bot.api.config.use(apiThrottler());
  bot.api.config.use(hydrateFiles(bot.token));
  bot.api.config.use(
    autoRetry({
      maxRetryAttempts: 5, // only repeat requests once
      maxDelaySeconds: 5, // fail immediately if we have to wait >5 seconds
      retryOnInternalServerErrors: true,
    }),
  );
  bot.api.setMyCommands([{ command: "start", description: "Start the bot" }]);

  const scheduleFeature = createScheduleFeature(bot);
  const conversationsFeature = createConversationFeature(repositories);

  protectedBot.use(sequentialize(getSessionKey));

  protectedBot.use(
    session({
      type: "multi",
      external: {
        getSessionKey,
        initial: createInitialExternalSessionData,
        storage: options.botSessionStorage,
      },
      memory: {
        getSessionKey,
        initial: createInitialMemorySessionData,
        storage: new MemorySessionStorage<MemorySessionData>(),
      },
      conversation: {
        getSessionKey,
      },
    }),
  );

  protectedBot.use(conversationsFeature);
  protectedBot.use(authMiddleware());

  protectedBot.use(startFeature);
  protectedBot.use(adminFeature);
  protectedBot.use(scheduleFeature);
  protectedBot.use(questionSettingFeature);
  protectedBot.use(userFeature);

  protectedBot.use(unhandledFeature);

  return bot;
}
