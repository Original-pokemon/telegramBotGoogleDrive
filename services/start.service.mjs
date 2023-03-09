import { InlineKeyboard } from 'grammy'

export function start() {
  return async (ctx) => {
    try {
      let buttons = new InlineKeyboard()
      if (ctx.session.isAdmin || ctx.session.isTopAdmin) {
        buttons = buttons.text('Открыть панель администратора', 'admin').row()
      }
      ctx.reply(
        `👋 Приветствую!\n\n` +
        `📸Данный бот предназначен для сбора фотографий.\n\n` +
        `🔒Как только Вам выдадут доступ этот бот будет присылать Вам уведомления о необходимости прохождении проверки стандартов`,
        {
          reply_markup: buttons,
        }
      )
    } catch (err) {
      console.error('start.service: \n' + err)
    }
  }
}
