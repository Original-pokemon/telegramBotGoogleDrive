import { startCheckCallback } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { handleFile, sendEndMessage } from "./index.js";

export async function editPhoto(ctx: Context) {
  try {
    // Проверка на команду 'startCheck'
    if (ctx.callbackQuery?.data === startCheckCallback) {
      ctx.session.external.scene = "";
      return;
    }

    // Проверка на наличие фотографии в сообщении
    if (!ctx.update.message?.photo) {
      try {
        await ctx.deleteMessage();
      } catch (error) {
        ctx.logger.debug("Error deleting message:", error);
      }

      return;
    }

    const { answers, customData } = ctx.session.external;

    if (!answers) {
      throw new Error("Answers not found");
    }

    if (typeof customData.answersIndex !== "number") {
      throw new TypeError("Answers index not found or is not a number");
    }

    const photo = answers[customData.answersIndex];
    if (!photo) {
      throw new Error("Photo not found");
    }

    // Получение файла
    const file = await handleFile(ctx);

    // Обновление данных фотографии
    photo.id = file.file_id;
    photo.urlFile = file.getUrl();

    // Очистка customData
    delete customData.answersIndex;

    // Отправка конечного сообщения
    await sendEndMessage(ctx);

    ctx.logger.info(`Photo updated successfully for ${photo.fileName}`);
  } catch (error) {
    if (error instanceof Error) {
      ctx.logger.error(`user.service > editPhoto: ${error.message}`);
    } else {
      ctx.logger.error("user.service > editPhoto: Unknown error occurred");
    }
  }
}
