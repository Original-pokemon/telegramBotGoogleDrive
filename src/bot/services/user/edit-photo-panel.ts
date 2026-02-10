import { editPhotoCallbackData } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { CallbackQueryContext } from "grammy";

export async function editPhotoPanel(ctx: CallbackQueryContext<Context>) {
  const { logger, session, callbackQuery } = ctx;
  const { customData, scene } = session.external;

  try {
    try {
      await ctx.deleteMessage();
    } catch (error) {
      logger.debug({ err: error }, "Error deleting message");
    }

    if (scene !== "end_msg") {
      logger.warn("Attempted to edit photo outside of end message scene.");
      return;
    }

    const { answers } = session.external;

    if (!answers || answers.length === 0) {
      const errorMessage = "Answers not found or empty";
      logger.error(`user.service > editPhotoPanel: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    const { answersIndex } = editPhotoCallbackData.unpack(callbackQuery.data);
    const photo = answers[answersIndex];

    if (!photo) {
      const errorMessage = `Photo not found at index ${answersIndex}`;
      logger.error(`user.service > editPhotoPanel: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    session.external.scene = "edit_photo";
    customData.answersIndex = answersIndex;

    await ctx.reply(`Отправьте новое фото: ${photo.fileName}`);
    logger.info(`Prompted user to send a new photo for ${photo.fileName}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`user.service > editPhotoPanel: ${error.message}`);
    } else {
      logger.error("user.service > editPhotoPanel: Unknown error occurred");
    }
  }
}
