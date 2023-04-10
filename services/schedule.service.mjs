import { InlineKeyboard } from 'grammy'

export function sendReminderMessage(botInstance, UsersRepository) {
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

  return async (ctx) => {
    try {
      if (ctx) {
        sendReminderToOne(ctx)
      } else {
        sendRemindersToAll()
      }
    } catch (err) {
      console.error('schedule.service > sendReminderMessage ' + err)
    }
  }

  async function sendRemindersToAll() {
    try {
      const users = await UsersRepository.getAllAzs()
      const promises = users.map(async (e) => {
        const id = e.Id
        try {
          await botInstance.api.sendMessage(id, MSG_TEXT, markup)
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (err) {
          console.error('Error sending message to user:', id, err)
        }
      })
      await Promise.all(promises)
    } catch (err) {
      console.error('Error sending reminders to all users:', err)
    }
  }

  async function sendReminderToOne(ctx) {
    try {
      try {
        await ctx.deleteMessage();
      } catch (err) {
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 60 * HOUR_WAIT))
      await ctx.reply(MSG_TEXT, markup)
    } catch (err) {
      console.error('Error sending reminder to user:', err)
    }
  }
}