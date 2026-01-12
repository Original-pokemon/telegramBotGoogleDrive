import { Composer, InlineKeyboard } from "grammy";
import { UserGroup } from "../../const.js";
import { Context } from "../context.js";
import { sendReminderToOne } from "../services/schedule.js";
import { userIdData } from "../callback-data/user-id-data.js";
import {
  adminPanel,
  userProfile,
  updateUserGroup,
  manageUserAccess,
  createUserFolder,
  requestNewUserName,
  userSearch,
  showGroups,
  showUsersByGroupPage,
  showManageUserMenu,
  viewUserFolders,
  newsletterPanel,
  editUserName,
  sendNewsletterForAll,
  confirmSendNewsletter,
  manageUsersPanel,
  manageSystemPanel,
  manageRolesPanel,
  showRoleDetails,
  showQuestionDetails,
  showGroupSelectionForUser,
  showQuestionsPanel,
  manageNotificationTimePanel,
  showTimeSelectionPanel,
} from "../services/admin/index.js";
import {
  accessUserData,
  createFolderData,
  editNameData,
  sendReminderData,
  updateUserGroupData,
  selectGroupData,
  backToGroupsData,
  showUsersPageData,
  backToQuestionsData,
  showQuestionsPageData,
  viewUserFoldersData,
  viewUserFoldersPageData,
  openFolderData,
  showAllUsersData,
  findUserData,
  setNotificationTimeData,
  configureQuestionsData,
  sendBroadcastData,
  manageUsersData,
  manageSystemData,
  manageRolesData,
  changeUserGroupData,
  backToUserProfileData,
  manageUserData,
  confirmSendNewsletterData,
  startEditRoleData,
  updateNotificationTimeActionData,
} from "../callback-data/index.js";
import { addBackButton } from "../helpers/keyboard.js";
import { logHandle } from "../helpers/logging.js";

export const TimeActions = {
  init: "init",
  incrHour: "incrHour",
  incrMinutes: "incrMinutes",
  decrHours: "decrHours",
  decrMinutes: "decrMinutes",
  save: "save"
} as const;

const Scene = {
  enterId: "enter_id",
  enterName: "enter_name",
  enterLetterText: "enter_letter_text",
  enterRoleId: "enter_role_id",
  enterRoleDescription: "enter_role_description",
  enterQuestionName: "enter_question_name",
  enterQuestionText: "enter_question_text",
  enterQuestionRequire: "enter_question_require",
} as const;

const AdminButtons = {
  FIND_USER: "Найти пользователя",
  ALL_USERS: "Показать всех пользователей",
  NEWS_LETTER: "Сделать рассылку",
};

type SceneType = (typeof Scene)[keyof typeof Scene];

const composer = new Composer<Context>();
const feature = composer
  .chatType("private")
  .filter(({ session }) => session.memory.isAdmin);

feature.callbackQuery(
  UserGroup.Admin,
  logHandle("callback-query-admin-panel"),
  adminPanel,
);
feature.callbackQuery(
  userIdData.filter(),
  logHandle("callback-query-user-profile"),
  async (ctx) => {
    const { id } = userIdData.unpack(ctx.callbackQuery.data);
    await userProfile(ctx, id);
  },
);
feature.callbackQuery(
  accessUserData.filter(),
  logHandle("callback-query-manage-user-access"),
  manageUserAccess,
);
feature.callbackQuery(
  updateUserGroupData.filter(),
  logHandle("callback-query-update-user-group"),
  updateUserGroup,
);
feature.callbackQuery(
  editNameData.filter(),
  logHandle("callback-query-edit-name"),
  requestNewUserName,
);
feature.callbackQuery(
  createFolderData.filter(),
  logHandle("callback-query-create-folder"),
  createUserFolder,
);
feature.callbackQuery(
  sendReminderData.filter(),
  logHandle("callback-query-send-reminder"),
  sendReminderToOne,
);
feature.callbackQuery(
  selectGroupData.filter(),
  logHandle("callback-query-select-group"),
  async (ctx) => {
    const { group } = selectGroupData.unpack(ctx.callbackQuery.data);
    await showUsersByGroupPage(ctx, group, 0);
  },
);
feature.callbackQuery(
  backToGroupsData.filter(),
  logHandle("callback-query-back-to-groups"),
  showGroups,
);
feature.callbackQuery(
  backToQuestionsData.filter(),
  logHandle("callback-query-back-to-questions"),
  (ctx) => showQuestionsPanel(ctx, 0),
);
feature.callbackQuery(
  showQuestionsPageData.filter(),
  logHandle("callback-query-show-questions-page"),
  async (ctx) => {
    const { pageIndex } = showQuestionsPageData.unpack(ctx.callbackQuery.data);
    await showQuestionsPanel(ctx, pageIndex);
  },
);

feature.callbackQuery(
  /^editQuestion:(\d+)$/,
  logHandle("callback-edit-question"),
  async (ctx) => {
    const questionId = Number.parseInt(ctx.match[1], 10);
    await showQuestionDetails(ctx, questionId);
  },
);

feature.callbackQuery(
  /^editQuestionName:(\d+)$/,
  logHandle("callback-edit-question-name"),
  async (ctx) => {
    const questionId = Number.parseInt(ctx.match[1], 10);
    ctx.session.external.editQuestionId = questionId;
    ctx.session.external.scene = Scene.enterQuestionName;
    await ctx.reply("Введите новое название вопроса:");
  },
);

feature.callbackQuery(
  /^editQuestionText:(\d+)$/,
  logHandle("callback-edit-question-text"),
  async (ctx) => {
    const questionId = Number.parseInt(ctx.match[1], 10);
    ctx.session.external.editQuestionId = questionId;
    ctx.session.external.scene = Scene.enterQuestionText;
    await ctx.reply("Введите новый текст вопроса:");
  },
);

feature.callbackQuery(
  /^toggleQuestionRequire:(\d+)$/,
  logHandle("callback-toggle-question-require"),
  async (ctx) => {
    const questionId = Number.parseInt(ctx.match[1], 10);
    const question = await ctx.repositories.questions.getQuestion(questionId);
    if (!question) {
      await ctx.reply("Вопрос не найден.");
      return;
    }
    await ctx.repositories.questions.updateQuestion({
      id: questionId,
      name: question.name,
      text: question.text,
      require: !question.require,
      groupIds: question.group.map((g) => g.id),
    });
    await ctx.reply(
      `Обязательность вопроса изменена на: ${question.require ? "Нет" : "Да"}`,
    );
    await showQuestionDetails(ctx, questionId, false);
  },
);

feature.callbackQuery(
  /^manageQuestionGroups:(\d+)$/,
  logHandle("callback-manage-question-groups"),
  async (ctx) => {
    const questionId = Number.parseInt(ctx.match[1], 10);
    const question = await ctx.repositories.questions.getQuestion(questionId);
    if (!question) {
      await ctx.reply("Вопрос не найден.");
      return;
    }

    const allGroups = await ctx.repositories.groups.getAllGroups();
    const questionGroupIds = new Set(question.group.map((g) => g.id));

    const keyboard = new InlineKeyboard();

    for (const group of allGroups) {
      if (
        group.id !== UserGroup.Admin &&
        group.description !== "ожидает выдачи роли"
      ) {
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

    addBackButton(keyboard, `backToQuestion:${questionId}`, "Назад к вопросу");

    const text = `Управление группами для вопроса "${question.name}"`;
    const options = {
      reply_markup: keyboard,
    };

    try {
      await ctx.editMessageText(text, options);
    } catch {
      // If edit fails, send new message
      await ctx.reply(text, options);
    }
  },
);

feature.callbackQuery(
  /^toggleQuestionGroup:(\d+):(.+)$/,
  logHandle("callback-toggle-question-group"),
  async (ctx) => {
    const questionId = Number.parseInt(ctx.match[1], 10);
    const groupId = ctx.match[2];
    const question = await ctx.repositories.questions.getQuestion(questionId);
    if (!question) {
      await ctx.reply("Вопрос не найден.");
      return;
    }
    const currentGroupIds = question.group.map((g) => g.id);
    let newGroupIds;
    newGroupIds = currentGroupIds.includes(groupId)
      ? currentGroupIds.filter((id) => id !== groupId)
      : [...currentGroupIds, groupId];
    await ctx.repositories.questions.updateQuestion({
      id: questionId,
      name: question.name,
      text: question.text,
      require: question.require,
      groupIds: newGroupIds,
    });
    // Update the message with new group management UI
    const updatedQuestion =
      await ctx.repositories.questions.getQuestion(questionId);
    if (!updatedQuestion) {
      await ctx.reply("Ошибка обновления.");
      return;
    }

    const allGroups = await ctx.repositories.groups.getAllGroups();
    const updatedGroupIds = new Set(updatedQuestion.group.map((g) => g.id));

    const keyboard = new InlineKeyboard();

    for (const group of allGroups) {
      if (
        group.id !== UserGroup.Admin &&
        group.description !== "ожидает выдачи роли"
      ) {
        const isBound = updatedGroupIds.has(group.id);
        const action = isBound ? "Удалить" : "Добавить";
        keyboard
          .text(
            `${group.description} (${action})`,
            `toggleQuestionGroup:${questionId}:${group.id}`,
          )
          .row();
      }
    }

    addBackButton(keyboard, `backToQuestion:${questionId}`, "Назад к вопросу");

    const text = `Управление группами для вопроса "${updatedQuestion.name}"`;
    const options = {
      reply_markup: keyboard,
    };

    try {
      await ctx.editMessageText(text, options);
    } catch {
      // If edit fails, send new message
      await ctx.reply(text, options);
    }
  },
);

feature.callbackQuery(
  /^backToQuestion:(\d+)$/,
  logHandle("callback-back-to-question"),
  async (ctx) => {
    const questionId = Number.parseInt(ctx.match[1], 10);
    const question = await ctx.repositories.questions.getQuestion(questionId);
    if (!question) {
      await ctx.reply("Вопрос не найден.");
      return;
    }

    const groupsText = question.group.map((g) => g.id).join(", ");

    const keyboard = new InlineKeyboard()
      .text("Изменить название", `editQuestionName:${questionId}`)
      .text("Изменить текст", `editQuestionText:${questionId}`)
      .row()
      .text(
        `Обязательный: ${question.require ? "Да" : "Нет"}`,
        `toggleQuestionRequire:${questionId}`,
      )
      .text("Управление группами", `manageQuestionGroups:${questionId}`)
      .row();

    addBackButton(keyboard, backToQuestionsData.pack({}));

    const text = `Вопрос: ${question.name}\nТекст: ${question.text}\nОбязательный: ${question.require ? "Да" : "Нет"}\nГруппы: ${groupsText}`;
    const options = {
      reply_markup: keyboard,
    };

    try {
      await ctx.editMessageText(text, options);
    } catch {
      // If edit fails, send new message
      await ctx.reply(text, options);
    }
  },
);

feature.callbackQuery(
  /^deleteQuestion:(\d+)$/,
  logHandle("callback-delete-question"),
  async (ctx) => {
    const questionId = Number.parseInt(ctx.match[1], 10);
    const question = await ctx.repositories.questions.getQuestion(questionId);
    if (!question) {
      await ctx.reply("Вопрос не найден.");
      return;
    }
    await ctx.editMessageText(
      `Вы уверены, что хотите удалить вопрос "${question.name}"?`,
      {
        reply_markup: new InlineKeyboard()
          .text("Да, удалить", `confirmDeleteQuestion:${questionId}`)
          .text("Отмена", backToQuestionsData.pack({})),
      },
    );
  },
);

feature.callbackQuery(
  /^confirmDeleteQuestion:(\d+)$/,
  logHandle("callback-confirm-delete-question"),
  async (ctx) => {
    const questionId = Number.parseInt(ctx.match[1], 10);
    await ctx.repositories.questions.deleteQuestion(questionId);
    await ctx.reply("Вопрос удален.");
    await showQuestionsPanel(ctx, 0);
  },
);

feature.callbackQuery(
  "createQuestion",
  logHandle("callback-create-question"),
  async (ctx) => {
    ctx.session.external.scene = Scene.enterQuestionName;
    await ctx.reply("Введите название вопроса:");
  },
);
feature.callbackQuery(
  showUsersPageData.filter(),
  logHandle("callback-query-show-users-page"),
  async (ctx) => {
    const { group, pageIndex } = showUsersPageData.unpack(
      ctx.callbackQuery.data,
    );
    await showUsersByGroupPage(ctx, group, pageIndex);
  },
);
feature.callbackQuery(
  viewUserFoldersData.filter(),
  logHandle("callback-query-view-user-folders"),
  async (ctx) => {
    const { userId } = viewUserFoldersData.unpack(ctx.callbackQuery.data);
    await viewUserFolders(ctx, userId, 0);
  },
);
feature.callbackQuery(
  viewUserFoldersPageData.filter(),
  logHandle("callback-query-view-user-folders-page"),
  async (ctx) => {
    const { userId, pageIndex } = viewUserFoldersPageData.unpack(
      ctx.callbackQuery.data,
    );
    await viewUserFolders(ctx, userId, pageIndex);
  },
);
feature.callbackQuery(
  openFolderData.filter(),
  logHandle("callback-query-open-folder"),
  async (ctx) => {
    const { folderId } = openFolderData.unpack(ctx.callbackQuery.data);
    await ctx.reply(
      `Ссылка на папку: https://drive.google.com/drive/folders/${folderId}`,
    );
  },
);
feature.callbackQuery(
  changeUserGroupData.filter(),
  logHandle("callback-query-change-user-group"),
  async (ctx) => {
    const { userId } = changeUserGroupData.unpack(ctx.callbackQuery.data);
    await showGroupSelectionForUser(ctx, userId);
  },
);
feature.callbackQuery(
  backToUserProfileData.filter(),
  logHandle("callback-query-back-to-user-profile"),
  async (ctx) => {
    const { userId } = backToUserProfileData.unpack(ctx.callbackQuery.data);
    await userProfile(ctx, userId);
  },
);
feature.callbackQuery(
  manageUserData.filter(),
  logHandle("callback-query-manage-user"),
  async (ctx) => {
    const { userId } = manageUserData.unpack(ctx.callbackQuery.data);
    await showManageUserMenu(ctx, userId);
  },
);
feature.callbackQuery(
  manageUsersData.filter(),
  logHandle("callback-query-manage-users"),
  manageUsersPanel,
);
feature.callbackQuery(
  manageSystemData.filter(),
  logHandle("callback-query-manage-system"),
  manageSystemPanel,
);
feature.callbackQuery(
  manageRolesData.filter(),
  logHandle("callback-query-manage-roles"),
  manageRolesPanel,
);
feature.callbackQuery(
  showAllUsersData.filter(),
  logHandle("callback-query-show-all-users"),
  showGroups,
);
feature.callbackQuery(
  findUserData.filter(),
  logHandle("callback-query-find-user"),
  userSearch,
);

feature.callbackQuery(
  setNotificationTimeData.filter(),
  logHandle("callback-query-set-notification-time"),
  manageNotificationTimePanel,
);

feature.callbackQuery(
  updateNotificationTimeActionData.filter(),
  logHandle("callback-update-notification-time"),
  showTimeSelectionPanel,
);

feature.callbackQuery(
  configureQuestionsData.filter(),
  logHandle("callback-query-configure-questions"),
  async (ctx) => showQuestionsPanel(ctx, 0),
);
feature.callbackQuery(
  sendBroadcastData.filter(),
  logHandle("callback-query-send-broadcast"),
  newsletterPanel,
);
feature.callbackQuery(
  confirmSendNewsletterData.filter(),
  logHandle("callback-query-confirm-send-newsletter"),
  async (ctx) => {
    const { action } = confirmSendNewsletterData.unpack(ctx.callbackQuery.data);
    await confirmSendNewsletter(ctx, action);
  },
);

feature.hears(AdminButtons.FIND_USER, logHandle("hears-find-user"), userSearch);
feature.hears(AdminButtons.ALL_USERS, logHandle("hears-all-users"), showGroups);
feature.hears(
  AdminButtons.NEWS_LETTER,
  logHandle("hears-news-letter"),
  newsletterPanel,
);

feature.callbackQuery(
  /^editRole:(.+)$/,
  logHandle("callback-edit-role"),
  async (ctx) => {
    const roleId = ctx.match[1];
    await showRoleDetails(ctx, roleId);
  },
);

feature.callbackQuery(
  startEditRoleData.filter(),
  logHandle("callback-start-edit-role"),
  async (ctx) => {
    const { roleId } = startEditRoleData.unpack(ctx.callbackQuery.data);
    ctx.session.external.editRoleId = roleId;
    ctx.session.external.scene = Scene.enterRoleDescription;
    await ctx.reply("Введите новое описание для роли:");
  },
);

feature.callbackQuery(
  /^deleteRole:(.+)$/,
  logHandle("callback-delete-role"),
  async (ctx) => {
    const roleId = ctx.match[1];
    // Check if users exist
    const users = await ctx.repositories.users.getAllUsers();
    const hasUsers = users.some((u) => u.group_id === roleId);
    if (hasUsers) {
      await ctx.reply(
        "Нельзя удалить роль, так как есть пользователи в этой роли.",
      );
      return;
    }
    await ctx.repositories.groups.deleteGroup(roleId);
    await ctx.reply("Роль удалена.");
    await manageRolesPanel(ctx);
  },
);

feature.callbackQuery(
  "createRole",
  logHandle("callback-create-role"),
  async (ctx) => {
    ctx.session.external.scene = Scene.enterRoleId;
    await ctx.reply("Введите ID новой роли:");
  },
);

const router = ({ session }: Context) => session.external.scene as SceneType;

const routeHandlers = {
  [Scene.enterId]: async (ctx: Context) => {
    await userProfile(ctx, ctx.msg?.text);
  },
  [Scene.enterName]: editUserName,
  [Scene.enterLetterText]: sendNewsletterForAll,
  [Scene.enterRoleId]: async (ctx: Context) => {
    const roleId = ctx.msg?.text;
    if (!roleId) return;
    ctx.session.external.newRoleId = roleId;
    ctx.session.external.scene = Scene.enterRoleDescription;
    await ctx.reply("Введите описание роли:");
  },
  [Scene.enterRoleDescription]: async (ctx: Context) => {
    const description = ctx.msg?.text;
    if (!description) return;
    const roleId =
      ctx.session.external.editRoleId || ctx.session.external.newRoleId;
    if (!roleId) return;
    if (ctx.session.external.editRoleId) {
      await ctx.repositories.groups.updateGroup(roleId, description);
      delete ctx.session.external.editRoleId;
      await ctx.reply("Описание роли обновлено.");
    } else if (ctx.session.external.newRoleId) {
      await ctx.repositories.groups.createGroup({ id: roleId, description });
      delete ctx.session.external.newRoleId;
      await ctx.reply("Роль создана.");
    }
    ctx.session.external.scene = "";
    await manageRolesPanel(ctx);
  },
  [Scene.enterQuestionName]: async (ctx: Context) => {
    const name = ctx.msg?.text;
    if (!name) return;
    if (ctx.session.external.editQuestionId) {
      const questionId = ctx.session.external.editQuestionId;
      const question = await ctx.repositories.questions.getQuestion(questionId);
      if (!question) return;
      await ctx.repositories.questions.updateQuestion({
        id: questionId,
        name,
        text: question.text,
        require: question.require,
        groupIds: question.group.map((g) => g.id),
      });
      delete ctx.session.external.editQuestionId;
      await ctx.reply("Название вопроса обновлено.");
      await showQuestionDetails(ctx, questionId, false);
    } else {
      ctx.session.external.newQuestionName = name;
      ctx.session.external.scene = Scene.enterQuestionText;
      await ctx.reply("Введите текст вопроса:");
    }
  },
  [Scene.enterQuestionText]: async (ctx: Context) => {
    const text = ctx.msg?.text;
    if (!text) return;
    if (ctx.session.external.editQuestionId) {
      const questionId = ctx.session.external.editQuestionId;
      const question = await ctx.repositories.questions.getQuestion(questionId);
      if (!question) return;
      await ctx.repositories.questions.updateQuestion({
        id: questionId,
        name: question.name,
        text,
        require: question.require,
        groupIds: question.group.map((g) => g.id),
      });
      delete ctx.session.external.editQuestionId;
      await ctx.reply("Текст вопроса обновлен.");
      await showQuestionDetails(ctx, questionId, false);
    } else {
      ctx.session.external.newQuestionText = text;
      ctx.session.external.scene = Scene.enterQuestionRequire;
      await ctx.reply("Вопрос обязательный? (да/нет):");
    }
  },
  [Scene.enterQuestionRequire]: async (ctx: Context) => {
    const requireText = ctx.msg?.text?.toLowerCase();
    if (!requireText) return;
    const require = requireText === "да";
    ctx.session.external.newQuestionRequire = require;
    // For simplicity, create with no groups, or add groups later
    const question = await ctx.repositories.questions.addQuestion({
      name: ctx.session.external.newQuestionName!,
      text: ctx.session.external.newQuestionText!,
      require,
      groupIds: [],
    });
    delete ctx.session.external.newQuestionName;
    delete ctx.session.external.newQuestionText;
    delete ctx.session.external.newQuestionRequire;
    ctx.session.external.scene = "";
    await ctx.reply(`Вопрос создан с ID: ${question.id}`);
    await showQuestionsPanel(ctx, 0, false);
  },
}

composer.route(router, routeHandlers);

export { composer as adminFeature };
