import type { Context } from "#root/bot/context.js";
import { Context as defaultContext, HearsContext } from "grammy";
import {
  handleCallbackQuery,
  handlePhotoMessage,
  handleRestartCheck,
} from "./index.js";

const hasPhoto = defaultContext.has.filterQuery(":photo");

export async function getPhotoAnswer(ctx: Context) {
  const { message, callback_query: callbackQuery } = ctx.update;

  // Проверяем, есть ли сообщение с фото или callback data
  if (!message?.photo && !callbackQuery?.data) return;

  try {
    // Проверяем, если пользователь прервал предыдущую проверку
    if (!message?.photo && callbackQuery?.data !== "skip_photo") {
      ctx.logger.debug("User interrupted previous check, restarting...");
      await ctx.deleteMessage();
      await handleRestartCheck(ctx);
      return;
    }

    // Проверяем правильность сцены
    if (ctx.session.external.scene !== "sending_photo") {
      ctx.logger.warn("Incorrect scene, restarting check required.");
      await ctx.deleteMessage();
      await ctx.reply("Пожалуйста, перезапустите проверку");
      return;
    }

    // Обработка callback запроса
    if (callbackQuery?.data) {
      ctx.logger.debug(
        `Handling callback query with data: ${callbackQuery.data}`,
      );
      await handleCallbackQuery(ctx);
      return;
    }

    // Обработка фото сообщения
    if (hasPhoto(ctx)) {
      ctx.logger.debug("Handling photo message.");
      await handlePhotoMessage(ctx as HearsContext<Context>);
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      ctx.logger.error(`Error in getPhotoAnswer: ${error.message}`);
    } else {
      ctx.logger.error("Unknown error in getPhotoAnswer.");
    }
  }
}
