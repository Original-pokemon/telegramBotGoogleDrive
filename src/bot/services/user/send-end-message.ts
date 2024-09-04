import { InlineKeyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import { END_MSG_TEXT } from "../../const.js";
import { sendPhotosCallback, showPhotosCallback } from "#root/bot/callback-data/index.js";

export const sendEndMessage = async (ctx: Context) => {
  const markup = new InlineKeyboard()
    .text('Показать все фото', showPhotosCallback)
    .row()
    .text('Отправить проверяющему', sendPhotosCallback);

  try {
    if (ctx.session.external.customData.lastMessageDate) {
      delete ctx.session.external.customData.lastMessageDate;
    }

    ctx.session.external.scene = 'end_msg';

    await ctx.reply(END_MSG_TEXT, { reply_markup: markup });

    ctx.logger.info(`End message sent by user: ${ctx.session.memory.user.name}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      ctx.logger.error(`Error sending end message: ${error.message}`);
    } else {
      ctx.logger.error('Unknown error occurred while sending end message');
    }
  }
};
