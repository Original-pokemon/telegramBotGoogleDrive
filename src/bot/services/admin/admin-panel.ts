import { Context } from "#root/bot/context.js";
import { InlineKeyboard } from "grammy";
import { addBackButton } from "#root/bot/helpers/keyboard.js";
import { UserGroup } from "#root/const.js";
import {
  manageUsersData,
  manageSystemData,
  showAllUsersData,
  findUserData,
  setNotificationTimeData,
  configureQuestionsData,
  sendBroadcastData,
} from "#root/bot/callback-data/index.js";
import { adminPanelTexts } from "./text.js";

function createAdminKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("Управлять пользователями", manageUsersData.pack({}))
    .row()
    .text("Управлять системой", manageSystemData.pack({}));
}

function createManageUsersKeyboard(): InlineKeyboard {
  const keyboard = new InlineKeyboard()
    .text(adminPanelTexts.SHOW_ALL_USERS, showAllUsersData.pack({}))
    .text(adminPanelTexts.FIND_USER, findUserData.pack({}))
    .row();
  return addBackButton(keyboard, UserGroup.Admin);
}

function createManageSystemKeyboard(): InlineKeyboard {
  const keyboard = new InlineKeyboard()
    .text(
      adminPanelTexts.SET_NOTIFICATION_TIME,
      setNotificationTimeData.pack({}),
    )
    .text(adminPanelTexts.CONFIGURE_QUESTIONS, configureQuestionsData.pack({}))
    .row()
    .text(adminPanelTexts.SEND_BROADCAST, sendBroadcastData.pack({}))
    .row();
  return addBackButton(keyboard, UserGroup.Admin);
}

export async function adminPanel(ctx: Context) {
  ctx.logger.trace("Admin panel command invoked");

  try {
    const keyboard = createAdminKeyboard();
    ctx.logger.debug("Admin keyboard created");

    await ctx.editMessageText(adminPanelTexts.MANAGE_USERS, {
      reply_markup: keyboard,
    });

    ctx.logger.debug("Admin panel message sent successfully");
  } catch (error) {
    ctx.logger.error(
      `Error in admin.service > adminPanel: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function manageUsersPanel(ctx: Context) {
  ctx.logger.trace("Manage users panel invoked");

  try {
    const keyboard = createManageUsersKeyboard();
    await ctx.editMessageText("Управление пользователями", {
      reply_markup: keyboard,
    });
  } catch (error) {
    ctx.logger.error(`Error in manageUsersPanel: ${error}`);
  }
}

export async function manageSystemPanel(ctx: Context) {
  ctx.logger.trace("Manage system panel invoked");

  try {
    const keyboard = createManageSystemKeyboard();
    await ctx.editMessageText("Управление системой", {
      reply_markup: keyboard,
    });
  } catch (error) {
    ctx.logger.error(`Error in manageSystemPanel: ${error}`);
  }
}
