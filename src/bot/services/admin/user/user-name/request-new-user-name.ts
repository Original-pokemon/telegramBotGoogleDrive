import { editNameData } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { CallbackQueryContext } from "grammy";

const NEW_USER_NAME_TEXT = "Введите новое имя пользователя";

export async function requestNewUserName(ctx: CallbackQueryContext<Context>) {
  const { callbackQuery, logger, session } = ctx;

  try {
    const { userId } = editNameData.unpack(callbackQuery.data);
    logger.debug(`Requesting new username for userId: ${userId}`);
    await ctx.editMessageText(NEW_USER_NAME_TEXT);
    session.external.scene = "enter_name";
    session.external.customData = session.external.customData || {};
    session.external.customData.userId = userId;

    logger.info(`User ID ${userId} stored in session for renaming.`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `Error in admin.service > requestNewUserName: ${error.message}`,
      );
    } else {
      logger.error(
        "An unknown error occurred in admin.service > requestNewUserName.",
      );
    }
  }
}
