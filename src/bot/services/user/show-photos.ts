import {
  editPhotoCallbackData,
  sendPhotosCallback,
} from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { InlineKeyboard } from "grammy";

export async function showPhotos(ctx: Context) {
  const { answers } = ctx.session.external;

  if (!answers) {
    const errorMessage = "Answers not found";
    ctx.logger.error(`user.service > showPhotos: ${errorMessage}`);
    throw new Error(errorMessage);
  }

  try {
    if (answers.length === 0) {
      try {
        await ctx.deleteMessage();
      } catch (error) {
        ctx.logger.debug({ err: error }, "Error deleting message");
      }
      return;
    }

    const promises = answers.map(async (photo, index) => {
      if (photo) {
        return ctx.replyWithPhoto(photo.id, {
          caption: photo.fileName,
          reply_markup: new InlineKeyboard().text(
            "Изменить",
            editPhotoCallbackData.pack({ answersIndex: index }),
          ),
        });
      }
      return false;
    });

    await Promise.allSettled(promises);

    await ctx.reply("Отправить проверяющему все как есть", {
      reply_markup: new InlineKeyboard().text("Отправить", sendPhotosCallback),
    });

    try {
      await ctx.deleteMessage();
    } catch (error) {
      ctx.logger.debug({ err: error }, "Error deleting message");
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      ctx.logger.error(`user.service > showPhotos: ${error.message}`);
    } else {
      ctx.logger.error("user.service > showPhotos: Unknown error occurred");
    }
    return false;
  }
}
