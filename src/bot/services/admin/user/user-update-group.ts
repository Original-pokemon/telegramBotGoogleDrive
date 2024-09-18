import {
  createFolderData,
  editNameData,
  updateUserGroupData,
} from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { CallbackQueryContext, InlineKeyboard } from "grammy";

const USER_NOT_FOUND = "Пользователь не найден!";
const ERROR_UPDATE_GROUP =
  "Произошла ошибка при обновлении группы пользователя.";
const BUTTON_TEXT_CHANGE_NAME = "Изменить";
const BUTTON_TEXT_KEEP_NAME = "Оставить как есть и выдать доступ";

function createChangeNameKeyboard(userId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text(BUTTON_TEXT_CHANGE_NAME, editNameData.pack({ userId }))
    .row()
    .text(BUTTON_TEXT_KEEP_NAME, createFolderData.pack({ userId }));
}

export async function updateUserGroup(ctx: CallbackQueryContext<Context>) {
  const { repositories, callbackQuery, logger } = ctx;
  logger.trace("Update group command invoked");

  try {
    const { userId, azsType } = updateUserGroupData.unpack(callbackQuery.data);
    logger.debug(`Unpacked data: userId=${userId}, azsType=${azsType}`);

    const user = await repositories.users.getUser(userId);
    if (!user) {
      logger.warn(`User with ID ${userId} not found`);
      return ctx.editMessageText(USER_NOT_FOUND);
    }

    await repositories.users.updateUser({
      id: userId,
      name: user.name,
      group_id: azsType,
      user_folder: user.user_folder,
    });
    logger.debug(
      `User group updated successfully for userId=${userId} to group=${azsType}`,
    );

    const getChangeNamePrompt = (userName: string) =>
      `Изменить имя пользователя ?\nТекущее имя: ${userName}\n\nШаблон: [azs][num]`;

    await ctx.editMessageText(getChangeNamePrompt(user.name), {
      reply_markup: createChangeNameKeyboard(userId),
    });
    logger.debug(`Prompt for changing name sent to userId=${userId}`);
  } catch (error) {
    logger.error(
      `Error in admin.service > updateGroup: ${error instanceof Error ? error.message : error}`,
    );
    return ctx.editMessageText(ERROR_UPDATE_GROUP);
  }
}
