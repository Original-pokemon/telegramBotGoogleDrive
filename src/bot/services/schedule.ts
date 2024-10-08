import { Bot, CallbackQueryContext, InlineKeyboard } from "grammy";

import logger from "#root/logger.js";
import { REMINDER_MSG_TEXT } from "../const.js";
import { Context } from "../context.js";
import UsersRepository from "../repositories/user.repository.js";
import {
  postponeCheckCallback,
  sendReminderData,
  startCheckCallback,
} from "../callback-data/index.js";

const markup = {
  reply_markup: new InlineKeyboard()
    .text("Да", startCheckCallback)
    .row()
    .text("Нет", postponeCheckCallback),
};

export const sendRemindersToAll = async (
  bot: Bot<Context>,
  userRepository: UsersRepository,
) => {
  try {
    const users = await userRepository.getAllAzs();
    const promises = users.map(async ({ id }) => {
      try {
        await bot.api.sendMessage(id, REMINDER_MSG_TEXT, markup);
      } catch (error) {
        logger.error("Error sending message to user:", id, error);
      }
    });
    await Promise.allSettled(promises);
  } catch (error) {
    logger.error("Error sending reminders to all users:", error);
  }
};

export async function sendReminderToOne(ctx: CallbackQueryContext<Context>) {
  const { userId } = sendReminderData.unpack(ctx.callbackQuery.data);
  try {
    try {
      await ctx.deleteMessage();
    } catch (error) {
      ctx.logger.debug("Error deleting message:", error);
    }

    await ctx.api.sendMessage(userId, REMINDER_MSG_TEXT, markup);

    await ctx.reply("Уведомление отправленно!");
  } catch (error) {
    ctx.logger.error("Error sending reminder to user:", error);
  }
}

export async function postponeReminder(ctx: CallbackQueryContext<Context>) {
  const HOUR_WAIT = 1;

  try {
    try {
      await ctx.deleteMessage();
    } catch (error) {
      ctx.logger.debug("Error deleting message:", error);
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 1000 * 60 * 60 * HOUR_WAIT);
    });

    await ctx.reply(REMINDER_MSG_TEXT, markup);
  } catch (error) {
    ctx.logger.error("Error deleting message:", error);
  }
}
