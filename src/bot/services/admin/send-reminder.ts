import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import { postponeCheckCallback, sendReminderData } from "#root/bot/callback-data/index.js";

const REMINDER_MSG_TEXT = "Пожалуйста, подтвердите выполнение задачи.";


function createReminderKeyboard() {
  return InlineKeyboard.from([
    [{ text: 'Да', callback_data: 'startCheck' }],
    [{ text: 'Нет', callback_data: postponeCheckCallback }]
  ]);
}

export async function sendReminderMessageForUser(ctx: CallbackQueryContext<Context>) {
  const { userId } = sendReminderData.unpack(ctx.callbackQuery.data);

  const markup = { reply_markup: createReminderKeyboard() };

  try {
    await ctx.api.sendMessage(userId, REMINDER_MSG_TEXT, markup);
    ctx.logger.info(`Reminder message sent to user ID: ${userId}`);

    await ctx.editMessageText('Уведомление отправленно!');
  } catch (error: unknown) {
    if (error instanceof Error) {
      ctx.logger.error(`Error sending reminder to user ID ${userId}: ${error.message}`);
    } else {
      ctx.logger.error('An unknown error occurred while sending reminder to user.');
    }
  }
};
