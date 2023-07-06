import { Bot, GrammyError, HttpError, session } from 'grammy';
import schedule from 'node-schedule';

import { autoRetry } from '@grammyjs/auto-retry';
import { hydrateFiles } from '@grammyjs/files';
import { Router } from '@grammyjs/router';
import { PsqlAdapter } from '@grammyjs/storage-psql';
import { apiThrottler } from '@grammyjs/transformer-throttler';

import adminRoute from './bot/admin.route.mjs';
import questionSettingRoute from './bot/question-setting.route.mjs';
import sheduleRoute from './bot/schedule.route.mjs';
import startRoute from './bot/start.route.mjs';
import userRoute from './bot/user.route.mjs';
import authMiddleware from './middleware/auth.mw.mjs';
import responseTimeMiddleware from './middleware/response-time.mw.mjs';
import getClient from './postgres-node/get-client.mjs';
import sendQuery from './postgres-node/send-query.mjs';
import QuestionRepository from './repositories/question.repository.mjs';
import UsersRepository from './repositories/user.repository.mjs';
import {
  adminPanel,
  createUserFolder,
  editUserName,
  getAllUsers,
  newsletterPanel,
  requestNewUserName,
  sendNewsletterForAll,
  sendReminderMessageForUser,
  updateGroup,
  userGroup,
  userProfile,
  userPromote,
  userSearch,
} from './services/admin.service.mjs';
import {
  addQuestion,
  checkAzsType,
  deleteQuestion,
  questionPanel,
  questionProfile,
  redirectUpdateQuestion,
  sendEditMessagePanel,
  showQuestionList,
  updateQuestionData,
} from './services/questionSetting.service.mjs';
import sendReminderMessage from './services/schedule.service.mjs';
import start from './services/start.service.mjs';
import {
  editPhoto,
  editPhotoPanel,
  getPhotoAnswer,
  saveToGoogle,
  showPhotos,
  userPanel,
} from './services/user.service.mjs';

function getSessionKey(context) {
  return context.chat?.id.toString();
}

function createInitialSessionData() {
  return {
    scene: '',
    isAdmin: false,
    user: {},
    isTopAdmin: false,
  };
}

export default async function initBot(utilsGDrive) {
  const bot = new Bot(process.env.BOT_TOKEN);

  const userRepository = new UsersRepository(sendQuery);
  const questionRepository = new QuestionRepository(sendQuery);

  bot.api.config.use(apiThrottler());
  bot.api.config.use(hydrateFiles(bot.token));
  bot.api.config.use(
    autoRetry({
      maxRetryAttempts: 5, // only repeat requests once
      maxDelaySeconds: 5, // fail immediately if we have to wait >5 seconds
      retryOnInternalServerErrors: true,
    })
  );

  const router = new Router((context) => context.session.scene);
  const client = await getClient();

  bot.use(
    session({
      getSessionKey,
      initial: createInitialSessionData,
      storage: await PsqlAdapter.create({
        tableName: 'session',
        client,
      }),
    })
  );

  bot.use(authMiddleware(bot, userRepository));
  bot.use(responseTimeMiddleware());
  bot.use(router);

  startRoute(bot, start());

  adminRoute(
    bot,
    router,
    adminPanel(),
    getAllUsers(userRepository),
    userSearch(bot),
    userProfile(userRepository),
    userPromote(userRepository),
    userGroup(userRepository),
    updateGroup(userRepository),
    requestNewUserName(),
    editUserName(userRepository),
    createUserFolder(bot, utilsGDrive, userRepository),
    sendReminderMessageForUser(bot),
    newsletterPanel(),
    sendNewsletterForAll(userRepository, bot)
  );

  sheduleRoute(bot, schedule, sendReminderMessage(bot, userRepository));

  userRoute(
    bot,
    router,
    userPanel(questionRepository),
    getPhotoAnswer(),
    showPhotos(),
    editPhotoPanel(),
    editPhoto(),
    saveToGoogle(utilsGDrive)
  );

  questionSettingRoute(
    bot,
    router,
    questionPanel(),
    showQuestionList(questionRepository),
    questionProfile(questionRepository),
    addQuestion(questionRepository),
    checkAzsType(),
    deleteQuestion(questionRepository),
    sendEditMessagePanel(),
    redirectUpdateQuestion(),
    updateQuestionData(questionRepository)
  );

  bot.api.setMyCommands([{ command: 'start', description: 'Start the bot' }]);

  bot.catch((botError) => {
    const { ctx, error } = botError;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    if (error instanceof GrammyError) {
      console.error('Error in request:', error.description);
    } else if (error instanceof HttpError) {
      console.error('Could not contact Telegram:', error);
    } else {
      console.error('Unknown error:', error);
    }
  });

  await bot.start();
  console.log('Bot started');
}
