import { CallbackQueryContext } from "grammy";
import { Context } from "#root/bot/context.js";
import { createFolderData } from "#root/bot/callback-data/index.js";

export async function createUserFolder(ctx: CallbackQueryContext<Context>) {
  const { repositories, callbackQuery, logger, config } = ctx;

  try {
    const { userId } = createFolderData.unpack(callbackQuery.data);
    logger.debug(`Unpacked userId from callback data: ${userId}`);

    const user = await repositories.users.getUser(userId);
    if (!user) {
      logger.error(`User with ID ${userId} not found`);
      throw new Error('User not found');
    }

    const response = await repositories.googleDrive.makeFolder({
      folderName: user.name,
      parentIdentifiers: config.MAIN_FOLDER_ID,
    });

    await repositories.users.updateUser({
      id: userId,
      name: user.name,
      group_id: user.group_id,
      user_folder: response,
    });

    logger.debug(`Successfully created user folder for userId=${userId}: ${response}`);

    await ctx.editMessageText(`Успешно создана папка: ${user.name}\nid: ${response}`);
    await ctx.api.sendMessage(
      userId,
      `Вам успешно выдали доступ\nВаше имя: ${user.name}`
    );

  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error in admin.service > createUserFolder: ${error.message}`);
    } else {
      logger.error('An unknown error occurred in admin.service > createUserFolder.');
    }
  }
};

