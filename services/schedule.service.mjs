import { InlineKeyboard } from 'grammy'

export function sendReminderMessage(botInstance, UsersRepository) {
  return async (ctx) => {
    try {
      const MSG_TEXT =
        'Приветствую! Необходимо пройти проверку стандартов обслуживания.👋\n\n' +
        'У вас есть 5 минут на то, что бы сделать фото и отправить его.⏳\n\n' +
        'Вы готовы приступить❔'
      const markup = {
        reply_markup: new InlineKeyboard()
          .text('Да', 'startCheck')
          .row()
          .text('Нет', 'postponeСheck'),
      }
      if (ctx) {
        await ctx.reply(MSG_TEXT, markup)
      } else {
        const users = await UsersRepository.getAllAzs()
        const promises = users.map(async (e) => {
          const id = e.Id
          await botInstance.api.sendMessage(id, MSG_TEXT, markup)

        })
        await Promise.all(promises)
      }
    } catch (err) {
      if (err.name == 'GrammyError') {
        return console.error("Error in request:", err.description);
      }
      console.error('schedule.service > sendReminderMessage ' + err)
    }
  }
}
