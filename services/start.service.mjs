import { InlineKeyboard } from 'grammy';

export default function start() {
  return async (context) => {
    try {
      let buttons = new InlineKeyboard();
      if (context.session.isAdmin || context.session.isTopAdmin) {
        buttons = buttons.text('Открыть панель администратора', 'admin').row();
      }
      context.reply(
        `👋 Приветствую!
📸Данный бот предназначен для сбора фотографий.
🔒Как только Вам выдадут доступ этот бот будет присылать Вам уведомления о необходимости прохождении проверки стандартов`,
        {
          reply_markup: buttons,
        }
      );
    } catch (error) {
      console.error(`start.service: \n${error}`);
    }
  };
}
