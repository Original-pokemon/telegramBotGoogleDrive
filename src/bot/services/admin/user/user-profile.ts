import { accessUserData, promoteUserData, sendReminderData } from "#root/bot/callback-data/index.js";
import { userIdData } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { UserGroup } from "#root/const.js";
import { InlineKeyboard } from "grammy";

const userProfileTexts = {
  NO_USER_ID: 'No user ID provided',
  USER_NOT_FOUND: 'User not found',
  USER_NOT_FOUND_RESPONSE: 'Данный пользователь не найден!',
};


function getUserInfo(created_date: string, id: string, name: string, group_id: string, user_folder: string | null) {
  return `Информация о пользователе:\nДата регистрации: ${created_date}\nID: ${id}\nНикнейм: ${name}\nРоль: ${group_id}\nЛичная папка: ${user_folder}`;
}

function createAdminPromotionButton(userId: string, isAdmin: boolean) {
  const text = isAdmin ? 'Разжаловать' : 'Повысить до администратора';
  return { text, callback_data: promoteUserData.pack({ userId }) };
}

function createAccessButton(userId: string, isWaitingConfirmation: boolean) {
  const text = isWaitingConfirmation ? 'Выдать доступ' : 'Ограничить доступ';
  return { text, callback_data: accessUserData.pack({ userId }) };
}


function createReminderButton(userId: string) {
  return { text: 'Отправить напоминание', callback_data: sendReminderData.pack({ userId }) };
}

function createUserProfileKeyboard(userId: string, group_id: string): InlineKeyboard {
  const markup = [
    [createAdminPromotionButton(userId, group_id === UserGroup.Admin)],
    [createAccessButton(userId, group_id === UserGroup.WaitConfirm)]
  ]

  if (group_id !== UserGroup.Admin && group_id !== UserGroup.WaitConfirm) {
    markup.push([createReminderButton(userId)])
  }

  const keyboard = InlineKeyboard.from(markup);

  return keyboard;
}

export async function userProfile(ctx: Context) {
  ctx.logger.trace("User profile requested");

  let id: string | undefined;

  if (ctx.callbackQuery?.data) {
    const callbackData = userIdData.unpack(ctx.callbackQuery.data);
    id = callbackData.id;
    ctx.logger.debug(`User ID unpacked from callback data: ${id}`);
  } else if (ctx.msg?.text) {
    id = ctx.msg.text;
    ctx.logger.debug(`User ID received from message text: ${id}`);
  }
  if (!id) {
    ctx.logger.error(userProfileTexts.NO_USER_ID);
    throw new Error(userProfileTexts.NO_USER_ID);
  }

  ctx.session.external.scene = '';
  ctx.logger.debug("Session scene cleared");

  try {
    const user = await ctx.repositories.users.getUser(id);

    if (!user) {
      await ctx.reply(userProfileTexts.USER_NOT_FOUND_RESPONSE);
      ctx.logger.debug(userProfileTexts.USER_NOT_FOUND);
      return
    }

    const { group_id, name, user_folder, created_date } = user;
    const markup = createUserProfileKeyboard(id, group_id);
    const formattedDate = new Date(created_date).toLocaleDateString();

    await ctx.reply(getUserInfo(formattedDate, id, name, group_id, user_folder), {
      reply_markup: markup,
    });

    ctx.logger.debug(`User profile sent for user ID: ${id}`);
    return true;

  } catch (error: unknown) {
    if (error instanceof Error) {
      ctx.logger.error(`Error in admin.service > userProfile: ${error.message}`);
      if (error.message === userProfileTexts.USER_NOT_FOUND) {
        await ctx.reply(userProfileTexts.USER_NOT_FOUND_RESPONSE);
        return true;
      }
    }
    return false;
  }
};