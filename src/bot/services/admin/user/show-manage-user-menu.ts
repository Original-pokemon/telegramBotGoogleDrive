import {
  accessUserData,
  promoteUserData,
  changeUserGroupData,
  backToUserProfileData,
} from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { InlineKeyboard } from "grammy";
import { addBackButton } from "#root/bot/helpers/keyboard.js";
import { UserGroup } from "#root/const.js";

export async function showManageUserMenu(ctx: Context, userId: string) {
  ctx.logger.trace(`Show manage user menu for user: ${userId}`);

  try {
    const user = await ctx.repositories.users.getUser(userId);
    if (!user) {
      await ctx.editMessageText("Пользователь не найден.");
      return;
    }

    const { group_id } = user;

    const groups = await ctx.repositories.groups.getAllGroups();
    const currentGroup = groups.find((g) => g.id === group_id);
    const currentRoleDescription = currentGroup
      ? currentGroup.description
      : group_id;

    const keyboard = new InlineKeyboard()
      .text(
        group_id === UserGroup.Admin
          ? "Разжаловать"
          : "Повысить до администратора",
        promoteUserData.pack({ userId }),
      )
      .row()
      .text(
        group_id === UserGroup.WaitConfirm
          ? "Выдать доступ"
          : "Ограничить доступ",
        accessUserData.pack({ userId }),
      )
      .row()
      .text(
        `Изменить роль (${currentRoleDescription})`,
        changeUserGroupData.pack({ userId }),
      )
      .row();

    addBackButton(keyboard, backToUserProfileData.pack({ userId }));

    await ctx.editMessageText("Выберите действие:", {
      reply_markup: keyboard,
    });
    ctx.logger.debug(`Manage user menu sent for user: ${userId}`);
  } catch (error) {
    ctx.logger.error(
      `Error in showManageUserMenu: ${error instanceof Error ? error.message : error}`,
    );
  }
}
