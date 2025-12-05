import {
  updateUserGroupData,
  backToUserProfileData,
} from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { InlineKeyboard } from "grammy";
import { addBackButton } from "#root/bot/helpers/keyboard.js";
import { UserGroup } from "#root/const.js";

export async function showGroupSelectionForUser(ctx: Context, userId: string) {
  ctx.logger.trace(`Show group selection for user: ${userId}`);

  try {
    const keyboard = new InlineKeyboard();

    for (const group of Object.values(UserGroup).filter(
      (g) => g !== UserGroup.Admin,
    ))
      keyboard
        .text(group, updateUserGroupData.pack({ userId, azsType: group }))
        .row();

    addBackButton(keyboard, backToUserProfileData.pack({ userId }));

    await ctx.editMessageText("Выберите новую роль для пользователя:", {
      reply_markup: keyboard,
    });
    ctx.logger.debug(`Group selection sent for user: ${userId}`);
  } catch (error) {
    ctx.logger.error(
      `Error in showGroupSelectionForUser: ${error instanceof Error ? error.message : error}`,
    );
  }
}
