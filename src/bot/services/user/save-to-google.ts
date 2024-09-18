import { Options } from "#root/bot/const.js";
import { Context } from "#root/bot/context.js";
import { AnswerType } from "#root/bot/types/answer.js";
import { GoogleRepositoryType } from "#root/google-drive/index.js";
import retry from "async-retry";
import _ from "lodash";

async function sendPhotosToDrive(
  GoogleRepository: GoogleRepositoryType,
  photos: AnswerType[],
  folderId: string,
) {
  const promises: Promise<string>[] = photos.map((photo) =>
    retry(async () => {
      return GoogleRepository.upload({
        urlPath: photo.urlFile,
        fileName: photo.fileName,
        parentIdentifiers: folderId,
      });
    }, Options),
  );

  await Promise.allSettled(promises);

  return true;
}

export async function saveToGoogle(ctx: Context) {
  const { session, repositories, logger } = ctx;
  const { answers } = session.external;
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const userFolder = session.memory.user.user_folder;
  const userId = session.memory.user.id;

  session.external.scene = "";

  if (!userFolder) {
    throw new Error("User folder not found");
  }

  if (!answers || answers.length === 0) {
    throw new Error("Answers not found");
  }

  try {
    let folderId = await repositories.photoFolders.getUserFolderByDate(
      userId,
      date,
    );

    if (!folderId) {
      folderId = await repositories.googleDrive.makeFolder({
        folderName: `${day}-${month}-${year}`,
        parentIdentifiers: userFolder,
      });

      await repositories.photoFolders.addFolder({
        folder_id: folderId,
        user_id: session.memory.user.id,
      });
    }

    await ctx.editMessageText("Фотографии отправляются ☑");

    await sendPhotosToDrive(
      repositories.googleDrive,
      _.compact(answers),
      folderId,
    );

    await ctx.editMessageText("Все фотографии отправлены ✅");

    session.external.questions = [];
    session.external.answers = [];

    return true;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error in saveToGoogle: ${error.message}`);
      await ctx.reply("Произошла ошибка при отправке фотографий.");
    } else {
      logger.error("Unknown error occurred in saveToGoogle.");
    }
    return false;
  }
}
