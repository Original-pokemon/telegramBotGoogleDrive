import { Composer } from 'grammy';
import { UserGroup } from '../../const.js';
import { Context } from '../context.js';
import { sendReminderToOne } from '../services/schedule.js';
import { userIdData } from '../callback-data/user-id-data.js';
import { adminPanel, userProfile, updateUserGroup, promoteUser, manageUserAccess, createUserFolder, requestNewUserName, userSearch, getAllUsers, newsletterPanel, editUserName, sendNewsletterForAll } from '../services/admin/index.js';
import { accessUserData, createFolderData, editNameData, promoteUserData, sendReminderData, updateUserGroupData } from '../callback-data/index.js';

const Scene = {
  enterId: 'enter_id',
  enterName: 'enter_name',
  enterLetterText: 'enter_letter_text'
} as const;

const AdminButtons = {
  FIND_USER: 'Найти пользователя',
  ALL_USERS: 'Показать всех пользователей',
  NEWS_LETTER: 'Сделать рассылку',
}

type SceneType = typeof Scene[keyof typeof Scene];

const composer = new Composer<Context>()
const feature = composer.chatType('private').filter(({ session }) => session.memory.isAdmin);

feature.callbackQuery(UserGroup.Admin, adminPanel);
feature.callbackQuery(userIdData.filter(), userProfile);
feature.callbackQuery(promoteUserData.filter(), promoteUser);
feature.callbackQuery(accessUserData.filter(), manageUserAccess);
feature.callbackQuery(updateUserGroupData.filter(), updateUserGroup);
feature.callbackQuery(editNameData.filter(), requestNewUserName);
feature.callbackQuery(createFolderData.filter(), createUserFolder);
feature.callbackQuery(sendReminderData.filter(), sendReminderToOne);

feature.hears(AdminButtons.FIND_USER, userSearch);
feature.hears(AdminButtons.ALL_USERS, getAllUsers);
feature.hears(AdminButtons.NEWS_LETTER, newsletterPanel);

const router = ({ session }: Context) => session.external.scene as SceneType;


const routeHandlers = {
  [Scene.enterId]: userProfile,
  [Scene.enterName]: editUserName,
  [Scene.enterLetterText]: sendNewsletterForAll
}

composer.route(router, routeHandlers);

export { composer as adminFeature };