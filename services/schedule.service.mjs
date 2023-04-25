import { InlineKeyboard } from 'grammy'
import retry from 'async-retry';
import { options } from '../variables.mjs'

const MSG_TEXT =
  'Приветствую! Необходимо пройти проверку стандартов обслуживания.👋\n\n' +
  'У вас есть 5 минут на то, что бы сделать фото и отправить его.⏳\n\n' +
  'Вы готовы приступить❔'
const HOUR_WAIT = 1

const markup = {
  reply_markup: new InlineKeyboard()
    .text('Да', 'startCheck')
    .row()
    .text('Нет', 'postponeСheck'),
}


const sendRemindersToAll = async (botInstance, UsersRepository) => {
  try {
    const users = await UsersRepository.getAllAzs()
    const promises = users.map(async (e) => {
      const id = e.Id
      try {
        await botInstance.api.sendMessage(id, MSG_TEXT, markup)
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (err) {
        console.error('Error sending message to user:', id, err)
        await retry(async () => await botInstance.api.sendMessage(id, MSG_TEXT, markup), options)
      }
    })
    await Promise.all(promises)
  } catch (err) {
    console.error('Error sending reminders to all users:', err)
  }
}

const sendReminderToOne = async (ctx) => {
  try {
    try {
      await ctx.deleteMessage();
    } catch (err) {
    }
    await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 60 * HOUR_WAIT))
    await retry(async () => await ctx.reply(MSG_TEXT, markup), options)
  } catch (err) {
    console.error('Error sending reminder to user:', err)
  }
}

export const sendReminderMessage = (botInstance, UsersRepository) => {
  return async (ctx) => {
    try {
      if (ctx) {
        sendReminderToOne(ctx)
      } else {
        sendRemindersToAll(botInstance, UsersRepository)
      }
    } catch (err) {
      console.error('schedule.service > sendReminderMessage ' + err)
    }
  }
}