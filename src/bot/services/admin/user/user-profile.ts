import {
  accessUserData,
  promoteUserData,
  sendReminderData,
  userIdData,
  viewUserFoldersData,
  changeUserGroupData,
  backToGroupsData,
  manageUserData,
} from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { UserGroup } from "#root/const.js";
import { InlineKeyboard } from "grammy";
import { addBackButton } from "#root/bot/helpers/keyboard.js";

const userProfileTexts = {
  NO_USER_ID: "No user ID provided",
  USER_NOT_FOUND: "User not found",
  USER_NOT_FOUND_RESPONSE: "Данный пользователь не найден!",
};

async function getUserInfo(
  created_date: string,
  id: string,
  name: string,
  group_id: string,
  user_folder: string | null,
  ctx: Context,
) {
  const folders = await ctx.repositories.photoFolders.getFoldersByUserId(id);
  const folderCount = folders.length;

  const groups = await ctx.repositories.groups.getAllGroups();
  const group = groups.find((g) => g.id === group_id);
  const roleDescription = group ? group.description : group_id;

  return `Информация о пользователе:\nДата регистрации: ${created_date}\nID: ${id}\nНикнейм: ${name}\nРоль: ${roleDescription}\nЛичная папка: ${user_folder}\nКоличество папок: ${folderCount}`;
}

function createAdminPromotionButton(userId: string, isAdmin: boolean) {
  const text = isAdmin ? "Разжаловать" : "Повысить до администратора";
  return { text, callback_data: promoteUserData.pack({ userId }) };
}

function createAccessButton(userId: string, isWaitingConfirmation: boolean) {
  const text = isWaitingConfirmation ? "Выдать доступ" : "Ограничить доступ";
  return { text, callback_data: accessUserData.pack({ userId }) };
}

function createReminderButton(userId: string) {
  return {
    text: "Отправить напоминание",
    callback_data: sendReminderData.pack({ userId }),
  };
}

function createViewFoldersButton(userId: string) {
  return {
    text: "Просмотреть папки",
    callback_data: viewUserFoldersData.pack({ userId }),
  };
}

function createManageUserButton(userId: string) {
  return {
    text: "Изменить данные",
    callback_data: manageUserData.pack({ userId }),
  };
}

function createUserProfileKeyboard(
  userId: string,
  group_id: string,
): InlineKeyboard {
  let keyboard = new InlineKeyboard()
    .text(
      createViewFoldersButton(userId).text,
      createViewFoldersButton(userId).callback_data,
    )
    .row()
    .text(
      createManageUserButton(userId).text,
      createManageUserButton(userId).callback_data,
    )
    .row();

  if (group_id !== UserGroup.Admin && group_id !== UserGroup.WaitConfirm) {
    keyboard = keyboard
      .text(
        createReminderButton(userId).text,
        createReminderButton(userId).callback_data,
      )
      .row();
  }

  return addBackButton(keyboard, backToGroupsData.pack({}));
}

export async function userProfile(ctx: Context, userId?: string) {
  ctx.logger.trace("User profile requested");

  let id: string | undefined = userId;

  if (!id && ctx.callbackQuery?.data) {
    const callbackData = userIdData.unpack(ctx.callbackQuery.data);
    id = callbackData.id;
    ctx.logger.debug(`User ID unpacked from callback data: ${id}`);
  } else if (!id && ctx.msg?.text) {
    id = ctx.msg.text;
    ctx.logger.debug(`User ID received from message text: ${id}`);
  }
  if (!id) {
    ctx.logger.error(userProfileTexts.NO_USER_ID);
    throw new Error(userProfileTexts.NO_USER_ID);
  }

  ctx.session.external.scene = "";
  ctx.logger.debug("Session scene cleared");

  try {
    const user = await ctx.repositories.users.getUser(id);

    if (!user) {
      await ctx.editMessageText(userProfileTexts.USER_NOT_FOUND_RESPONSE);
      ctx.logger.debug(userProfileTexts.USER_NOT_FOUND);
      return;
    }

    const { group_id, name, user_folder, created_date } = user;
    const markup = createUserProfileKeyboard(id, group_id);
    const formattedDate = new Date(created_date).toLocaleDateString();

    const userInfo = await getUserInfo(
      formattedDate,
      id,
      name,
      group_id,
      user_folder,
      ctx,
    );

    await ctx.editMessageText(userInfo, {
      reply_markup: markup,
    });

    ctx.logger.debug(`User profile sent for user ID: ${id}`);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      ctx.logger.error(
        `Error in admin.service > userProfile: ${error.message}`,
      );
      if (error.message === userProfileTexts.USER_NOT_FOUND) {
        await ctx.reply(userProfileTexts.USER_NOT_FOUND_RESPONSE);
        return true;
      }
    }
    return false;
  }
}
