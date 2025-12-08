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
  manageRolesData,
  startEditRoleData,
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
    .text("Управление ролями", manageRolesData.pack({}))
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

export async function manageRolesPanel(ctx: Context) {
  ctx.logger.trace("Manage roles panel invoked");

  try {
    const groups = await ctx.repositories.groups.getAllGroups();
    ctx.logger.debug(`Retrieved ${groups.length} groups from database`);

    const keyboard = new InlineKeyboard();

    for (const { id, description } of groups) {
      if (id !== UserGroup.Admin) {
        keyboard
          .text(`${description} (ID: ${id})`, `editRole:${id}`)
          .text("Удалить", `deleteRole:${id}`)
          .row();
      }
    }

    keyboard.text("Создать роль", "createRole").row();

    addBackButton(keyboard, manageSystemData.pack({}));

    await ctx.reply("Управление ролями", {
      reply_markup: keyboard,
    });
  } catch (error) {
    ctx.logger.error(`Error in manageRolesPanel: ${error}`);
  }
}

export async function showRoleDetails(ctx: Context, roleId: string) {
  ctx.logger.trace(`Show role details invoked for role: ${roleId}`);

  try {
    const groups = await ctx.repositories.groups.getAllGroups();
    const group = groups.find((g) => g.id === roleId);
    if (!group) {
      await ctx.reply("Роль не найдена.");
      return;
    }

    const users = await ctx.repositories.users.getAllUsers();
    const userCount = users.filter((u) => u.group_id === roleId).length;

    const keyboard = new InlineKeyboard()
      .text("Изменить", startEditRoleData.pack({ roleId }))
      .row();

    addBackButton(keyboard, manageRolesData.pack({}));

    await ctx.editMessageText(
      `Роль: ${group.description}\nID: ${group.id}\nКоличество пользователей: ${userCount}`,
      {
        reply_markup: keyboard,
      },
    );
  } catch (error) {
    ctx.logger.error(`Error in showRoleDetails: ${error}`);
  }
}
