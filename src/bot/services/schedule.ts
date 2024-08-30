import { Bot, CallbackQueryContext, InlineKeyboard } from 'grammy';

import { REMINDER_MSG_TEXT } from '../const.js';
import { Context } from '../context.js';
import UsersRepository from '../repositories/user.repository.js';
import { sendReminderData } from '../callback-data/index.js';

const HOUR_WAIT = 1;

const markup = {
  reply_markup: new InlineKeyboard()
    .text('Да', 'startCheck')
    .row()
    .text('Нет', 'postponeСheck'),
};

export const sendRemindersToAll = async (bot: Bot<Context>, userRepository: UsersRepository) => {
  try {
    const users = await userRepository.getAllAzs();
    const promises = users.map(async ({ id }) => {
      try {
        await bot.api.sendMessage(id, REMINDER_MSG_TEXT, markup);
      } catch (error) {
        console.error('Error sending message to user:', id, error);
      }
    });
    await Promise.all(promises);
  } catch (error) {
    console.error('Error sending reminders to all users:', error);
  }
};

export async function sendReminderToOne(ctx: CallbackQueryContext<Context>) {
  const { userId } = sendReminderData.unpack(ctx.callbackQuery.data);
  try {
    await ctx.deleteMessage()

    // await new Promise((resolve) => {
    //   setTimeout(resolve, 1000 * 60 * 60 * HOUR_WAIT);
    // });

    await ctx.api.sendMessage(userId, REMINDER_MSG_TEXT, markup);
  } catch (error) {
    ctx.logger.error('Error sending reminder to user:', error);
  }
};
