import { Context } from "#root/bot/context.js";
import { InlineKeyboard } from "grammy";
import {
  addBackButton,
  paginateItems,
  getPageKeyboard,
} from "#root/bot/helpers/keyboard.js";
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
  backToQuestionsData,
  showQuestionsPageData,
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

export async function showQuestionsPanel(
  ctx: Context,
  pageIndex: number = 0,
  edit: boolean = true,
) {
  ctx.logger.trace(`Show questions page invoked, page: ${pageIndex}`);

  try {
    const questions = await ctx.repositories.questions.getAllQuestions();
    ctx.logger.debug(`Retrieved ${questions.length} questions from database`);

    const pageSize = 20;
    const pages = paginateItems(questions, pageSize);
    const totalPages = pages.length;

    let adjustedPageIndex = pageIndex;
    if (adjustedPageIndex >= totalPages) {
      adjustedPageIndex = totalPages - 1;
    }

    const currentPageQuestions = pages[adjustedPageIndex] || [];

    const pageItems = currentPageQuestions.map(({ id, name }) => {
      return {
        text: name,
        callback_data: `editQuestion:${id}`,
      };
    });

    const keyboard = getPageKeyboard(
      pageItems,
      adjustedPageIndex,
      totalPages,
      showQuestionsPageData,
      {},
    );

    keyboard
      .row()
      .text(" ", " ")
      .row()
      .text("Создать вопрос", "createQuestion")
      .row();

    addBackButton(keyboard, manageSystemData.pack({}));

    const text = `Настройка вопросов - Страница ${adjustedPageIndex + 1}/${totalPages}`;
    const options = {
      reply_markup: keyboard,
    };

    await (edit
      ? ctx.editMessageText(text, options)
      : ctx.reply(text, options));
  } catch (error) {
    ctx.logger.error(`Error in showQuestionsPage: ${error}`);
  }
}

export async function showQuestionDetails(
  ctx: Context,
  questionId: number,
  edit: boolean = true,
) {
  ctx.logger.trace(`Show question details invoked for question: ${questionId}`);

  try {
    const question = await ctx.repositories.questions.getQuestion(questionId);
    if (!question) {
      await ctx.reply("Вопрос не найден.");
      return;
    }

    const groupsText =
      question.group.length > 0
        ? question.group.map((g) => g.description).join(", ")
        : "Нет групп";

    const keyboard = new InlineKeyboard()
      .text("Изменить название", `editQuestionName:${questionId}`)
      .text("Изменить текст", `editQuestionText:${questionId}`)
      .row()
      .text(
        `Обязательный: ${question.require ? "Да" : "Нет"}`,
        `toggleQuestionRequire:${questionId}`,
      )
      .text("Управление группами", `manageQuestionGroups:${questionId}`)
      .row()
      .text("Удалить вопрос", `deleteQuestion:${questionId}`)
      .row();

    addBackButton(keyboard, backToQuestionsData.pack({}));

    const text = `Вопрос: ${question.name}\nТекст: ${question.text}\nОбязательный: ${question.require ? "Да" : "Нет"}\nГруппы: ${groupsText}`;
    const options = {
      reply_markup: keyboard,
    };

    await (edit
      ? ctx.editMessageText(text, options)
      : ctx.reply(text, options));
  } catch (error) {
    ctx.logger.error(`Error in showQuestionDetails: ${error}`);
  }
}

export async function showQuestionGroupsManagement(
  ctx: Context,
  questionId: number,
) {
  ctx.logger.trace(
    `Show question groups management for question: ${questionId}`,
  );

  try {
    const question = await ctx.repositories.questions.getQuestion(questionId);
    if (!question) {
      await ctx.reply("Вопрос не найден.");
      return;
    }

    const allGroups = await ctx.repositories.groups.getAllGroups();
    const questionGroupIds = new Set(question.group.map((g) => g.id));

    const keyboard = new InlineKeyboard();

    for (const group of allGroups) {
      if (group.id !== UserGroup.Admin) {
        const isBound = questionGroupIds.has(group.id);
        const action = isBound ? "Удалить" : "Добавить";
        keyboard
          .text(
            `${group.description} (${action})`,
            `toggleQuestionGroup:${questionId}:${group.id}`,
          )
          .row();
      }
    }

    keyboard
      .row()
      .row()
      .text("Назад к вопросу", `backToQuestion:${questionId}`);

    await ctx.reply(`Управление группами для вопроса "${question.name}"`, {
      reply_markup: keyboard,
    });
  } catch (error) {
    ctx.logger.error(`Error in showQuestionGroupsManagement: ${error}`);
  }
}
