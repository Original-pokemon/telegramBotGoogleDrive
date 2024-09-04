import { Composer } from "grammy";
import { Context } from "../context.js";
import { editPhotoCallbackData, sendPhotosCallback, showPhotosCallback, skipPhotoCallback, startCheckCallback } from "../callback-data/index.js";
import { editPhotoPanel, saveToGoogle, showPhotos, userPanel, getPhotoAnswer, editPhoto } from "../services/user/index.js";

const composer = new Composer<Context>();
const feature = composer.chatType('private')

const Scene = {
  sendingPhoto: 'sending_photo',
  editPhoto: 'edit_photo',
} as const;

type SceneType = typeof Scene[keyof typeof Scene];

feature.callbackQuery(startCheckCallback, userPanel);
feature.callbackQuery(showPhotosCallback, showPhotos);
feature.callbackQuery(editPhotoCallbackData.filter(), editPhotoPanel);
feature.callbackQuery(sendPhotosCallback, saveToGoogle);
feature.callbackQuery(skipPhotoCallback, getPhotoAnswer);

const router = ({ session }: Context) => session.external.scene as SceneType;

const routeHandlers = {
  [Scene.sendingPhoto]: getPhotoAnswer,
  [Scene.editPhoto]: editPhoto,
};

feature.route(router, routeHandlers);


export { composer as userFeature }