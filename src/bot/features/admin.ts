import { Composer } from "grammy";
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
  manageUsersPanel,
  manageSystemPanel,
  showGroupSelectionForUser,
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
  changeUserGroupData,
  backToUserProfileData,
  manageUserData,
} from "../callback-data/index.js";
import { logHandle } from "../helpers/logging.js";

const Scene = {
  enterId: "enter_id",
  enterName: "enter_name",
  enterLetterText: "enter_letter_text",
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
  async (ctx) => {
    await ctx.reply("Настройка времени оповещения не реализована");
  },
);
feature.callbackQuery(
  configureQuestionsData.filter(),
  logHandle("callback-query-configure-questions"),
  async (ctx) => {
    await ctx.reply("Настройка вопросов не реализована");
  },
);
feature.callbackQuery(
  sendBroadcastData.filter(),
  logHandle("callback-query-send-broadcast"),
  newsletterPanel,
);

feature.hears(AdminButtons.FIND_USER, logHandle("hears-find-user"), userSearch);
feature.hears(AdminButtons.ALL_USERS, logHandle("hears-all-users"), showGroups);
feature.hears(
  AdminButtons.NEWS_LETTER,
  logHandle("hears-news-letter"),
  newsletterPanel,
);

const router = ({ session }: Context) => session.external.scene as SceneType;

const routeHandlers = {
  [Scene.enterId]: async (ctx: Context) => {
    await userProfile(ctx, ctx.msg?.text);
  },
  [Scene.enterName]: editUserName,
  [Scene.enterLetterText]: sendNewsletterForAll,
};

composer.route(router, routeHandlers);

export { composer as adminFeature };
