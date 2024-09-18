import { Composer } from "grammy";
import { Context } from "../context.js";
import {
  editPhotoCallbackData,
  sendPhotosCallback,
  showPhotosCallback,
  skipPhotoCallback,
  startCheckCallback,
} from "../callback-data/index.js";
import {
  editPhotoPanel,
  saveToGoogle,
  showPhotos,
  userPanel,
  getPhotoAnswer,
  editPhoto,
} from "../services/user/index.js";
import { logHandle } from "../helpers/logging.js";

const composer = new Composer<Context>();
const feature = composer.chatType("private");

const Scene = {
  sendingPhoto: "sending_photo",
  editPhoto: "edit_photo",
} as const;

type SceneType = (typeof Scene)[keyof typeof Scene];

feature.callbackQuery(
  startCheckCallback,
  logHandle("callback-query-user-panel"),
  userPanel,
);
feature.callbackQuery(
  showPhotosCallback,
  logHandle("callback-query-show-photos"),
  showPhotos,
);
feature.callbackQuery(
  editPhotoCallbackData.filter(),
  logHandle("callback-query-edit-photo"),
  editPhotoPanel,
);
feature.callbackQuery(
  sendPhotosCallback,
  logHandle("callback-query-save-to-google"),
  saveToGoogle,
);
feature.callbackQuery(
  skipPhotoCallback,
  logHandle("callback-query-get-photo"),
  getPhotoAnswer,
);

const router = ({ session }: Context) => session.external.scene as SceneType;

const routeHandlers = {
  [Scene.sendingPhoto]: getPhotoAnswer,
  [Scene.editPhoto]: editPhoto,
};

feature.route(router, routeHandlers);

export { composer as userFeature };
