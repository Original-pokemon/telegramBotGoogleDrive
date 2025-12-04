import { Composer } from "grammy";
import { UserGroup } from "../../const.js";
import { Context } from "../context.js";
import { sendReminderToOne } from "../services/schedule.js";
import { userIdData } from "../callback-data/user-id-data.js";
import {
  adminPanel,
  userProfile,
  updateUserGroup,
  promoteUser,
  manageUserAccess,
  createUserFolder,
  requestNewUserName,
  userSearch,
  showGroups,
  showUsersByGroupPage,
  viewUserFolders,
  newsletterPanel,
  editUserName,
  sendNewsletterForAll,
} from "../services/admin/index.js";
import {
  accessUserData,
  createFolderData,
  editNameData,
  promoteUserData,
  sendReminderData,
  updateUserGroupData,
  selectGroupData,
  backToGroupsData,
  showUsersPageData,
  viewUserFoldersData,
  viewUserFoldersPageData,
  openFolderData,
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
  userProfile,
);
feature.callbackQuery(
  promoteUserData.filter(),
  logHandle("callback-query-promote-user"),
  promoteUser,
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

feature.hears(AdminButtons.FIND_USER, logHandle("hears-find-user"), userSearch);
feature.hears(AdminButtons.ALL_USERS, logHandle("hears-all-users"), showGroups);
feature.hears(
  AdminButtons.NEWS_LETTER,
  logHandle("hears-news-letter"),
  newsletterPanel,
);

const router = ({ session }: Context) => session.external.scene as SceneType;

const routeHandlers = {
  [Scene.enterId]: userProfile,
  [Scene.enterName]: editUserName,
  [Scene.enterLetterText]: sendNewsletterForAll,
};

composer.route(router, routeHandlers);

export { composer as adminFeature };
