import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import {
  accessUserData,
  updateUserGroupData,
} from "#root/bot/callback-data/index.js";
import type { UserGroupType } from "#root/bot/types/user-group.js";
import { UserGroup } from "#root/const.js";

export async function manageUserAccess(context: CallbackQueryContext<Context>) {
  const { session, callbackQuery, logger, repositories } = context;

  try {
    const { userId } = accessUserData.unpack(callbackQuery.data);
    logger.debug(`Processing user group change for user ID: ${userId}`);

    const user = await repositories.users.getUser(userId);

    if (!user) {
      logger.error(`User with ID ${userId} not found.`);
      return await context.editMessageText("Пользователь не найден.");
    }

    if (!session.memory.isAdmin) {
      logger.warn("Access denied: user is not an administrator.");
      return await context.editMessageText("Вы не администратор!");
    }

    if (userId === session.memory.user.id) {
      logger.debug("Attempt to restrict access to oneself.");
      return await context.editMessageText(
        "Вы не можете ограничить доступ самому себе!",
      );
    }

    if (user.group_id === UserGroup.Admin) {
      logger.debug("Attempt to restrict access to an administrator.");
      return await context.editMessageText(
        "Вы не можете ограничить доступ администратору!",
      );
    }

    if (user.group_id === UserGroup.WaitConfirm) {
      const groups = await repositories.groups.getAllGroups();
      const layout = [];

      for (let index = 0; index <= groups.length - 1; index += 1) {
        const groupId = groups[index].id;

        if (!(groupId in [UserGroup.Admin, UserGroup.WaitConfirm])) {
          layout.push([
            {
              text: groupId,
              callback_data: updateUserGroupData.pack({
                userId,
                azsType: groupId,
              }),
            },
          ]);
        }
      }

      const markup = InlineKeyboard.from(layout);

      logger.info(`Prompting to select group type for user ID: ${userId}`);
      await context.editMessageText("Выберите тип АЗС", {
        reply_markup: markup,
      });
    } else if (
      [
        UserGroup.Azs,
        UserGroup.AzsWithStore,
        UserGroup.Admin,
        UserGroup.Gpn,
      ].includes(user.group_id as Exclude<UserGroupType, "waitConfirm">)
    ) {
      await repositories.users.updateUser({
        id: userId,
        name: user.name,
        group_id: UserGroup.WaitConfirm,
        user_folder: user.user_folder,
      });
      logger.info(`Access restricted for user ID: ${userId}`);

      await context.editMessageText("Пользователю успешно ограничен доступ!");
    }

    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error in admin.service > userGroup: ${error.message}`);
    } else {
      logger.error("An unknown error occurred in admin.service > userGroup.");
    }
    return false;
  }
}
