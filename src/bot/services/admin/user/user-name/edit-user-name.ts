import { InlineKeyboard } from "grammy";
import { createFolderData } from "#root/bot/callback-data/index.js";
import { HearsContext } from "grammy";
import { Context } from "#root/bot/context.js";


export async function editUserName(ctx: Context) {
  const { session, repositories, logger } = ctx;
  const { userId } = session.customData;
  const newName = ctx.msg?.text;

  if (!userId) {
    const errorMessage = 'userId not found in session.customData';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (typeof userId !== 'string') {
    const errorMessage = 'userId is not a string';
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (!newName) {
    logger.warn('New name is empty');
    await ctx.reply('Имя не может быть пустым');
    return;
  }

  try {
    const user = await repositories.users.getUser(userId);
    if (!user) {
      logger.warn(`User with ID ${userId} not found`);
      await ctx.reply('Пользователь не найден');
      return;
    }

    await repositories.users.updateUser({
      id: userId,
      name: newName,
      group_id: user.group_id,
      user_folder: user.user_folder
    });

    logger.debug(`User ID ${userId} name updated to ${newName}`);

    await ctx.reply('Имя успешно обновлено', {
      reply_markup: InlineKeyboard.from([
        [{ text: 'Выдать доступ', callback_data: createFolderData.pack({ userId }) }],
      ]),
    });

    session.scene = '';
    delete session.customData.userId;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error in admin.service > editUserName: ${error.message}`);
    } else {
      logger.error('An unknown error occurred in admin.service > editUserName.');
    }
  }
};
