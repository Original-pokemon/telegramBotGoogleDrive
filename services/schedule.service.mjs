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
      if (err.name == 'GrammyError') {
        return console.error("Error in request:", err.description);
      }
      console.error('schedule.service > sendReminderMessage ' + err)
    }
  }

  async function sendRemindersToAll() {
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
  }

  async function sendReminderToOne(ctx) {
    await ctx.deleteMessage()
    await new Promise(resolve => setTimeout(resolve, 1000 * 60 * 60 * HOUR_WAIT))
    await ctx.reply(MSG_TEXT, markup)
  }


}
