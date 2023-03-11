import dotenv from 'dotenv'
import { Bot, session, GrammyError, HttpError } from 'grammy'
import { Router } from '@grammyjs/router'
import { hydrateFiles } from '@grammyjs/files'
import * as schedule from 'node-schedule'
import { initGoogleDrive } from './google-drive/initGoogleDrive.mjs'

dotenv.config()

const config = process.env

const bot = new Bot(config.BOT_TOKEN)

bot.api.config.use(hydrateFiles(bot.token))

const router = new Router((ctx) => ctx.session.scene)
let utilsGDrive
bot.use(
  session({
    initial: () => ({
      scene: '',
      isAdmin: false,
      user: {},
      isTopAdmin: false,
      customData: {},
      questions: [],
      photo: [],
    }),
  })
)

import { authMiddleware } from './middleware/auth.mw.mjs'
import { responseTimeMiddleware } from './middleware/responseTime.mw.mjs'


bot.use(authMiddleware(bot, new UsersRepository()))
bot.use(responseTimeMiddleware())
bot.use(router)

import { initBase } from './postgres-node/initBase.mjs'

import { GroupRepository } from './repositories/group.repositoy.mjs'
import { UsersRepository } from './repositories/user.repository.mjs'
import { QuestionRepository } from './repositories/question.repository.mjs'

import { startRoute } from './bot/start.route.mjs'
import { start } from './services/start.service.mjs'

import { adminRoute } from './bot/admin.route.mjs'
import {
  adminPanel,
  userSearch,
  userProfile,
  getAllUsers,
  userPromote,
  userGroup,
  updateGroup,
  requestNewUserName,
  editUserName,
  createUserFolder,
} from './services/admin.service.mjs'

import { sheduleRoute } from './bot/schedule.route.mjs'
import { sendReminderMessage } from './services/schedule.service.mjs'

import { userRoute } from './bot/user.route.mjs'
import {
  userPanel,
  getPhotoAnswer,
  showPhotos,
  editPhoto,
  editPhotoPanel,
  saveToGoogle,
} from './services/user.service.mjs'

import { questionSettingRoute } from './bot/questionSetting.route.mjs'
import { questionPanel, questionProfile, showQuestionList, addQuestion, checkAzsType, deleteQuestion, sendEditMessagePanel, redirectUpdateQuestion, updateQuestionData } from './services/questionSetting.service.mjs'

startRoute(bot, start())

adminRoute(
  bot,
  router,
  adminPanel(),
  getAllUsers(new UsersRepository()),
  userSearch(bot),
  userProfile(new UsersRepository()),
  userPromote(new UsersRepository()),
  userGroup(new UsersRepository()),
  updateGroup(new UsersRepository()),
  requestNewUserName(),
  editUserName(new UsersRepository()),
  createUserFolder(bot, utilsGDrive, new UsersRepository())
)

sheduleRoute(
  bot,
  schedule,
  sendReminderMessage(bot, new UsersRepository())
)

userRoute(
  bot,
  router,
  userPanel(new QuestionRepository()),
  getPhotoAnswer(),
  showPhotos(),
  editPhotoPanel(),
  editPhoto(),
  saveToGoogle(utilsGDrive)
)

questionSettingRoute(
  bot,
  router,
  questionPanel(),
  showQuestionList(new QuestionRepository()),
  questionProfile(new QuestionRepository()),
  addQuestion(new QuestionRepository()),
  checkAzsType(),
  deleteQuestion(new QuestionRepository()),
  sendEditMessagePanel(),
  redirectUpdateQuestion(),
  updateQuestionData(new QuestionRepository())
)

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

initBase(new GroupRepository()).then(() => {
  utilsGDrive = initGoogleDrive({
    credentials: './credentials.json',
    token: './token.json'
  }).then(() => {
    bot.start()
    console.log('Bot started')
  })
})
