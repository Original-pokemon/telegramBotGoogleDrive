import { createCallbackData } from "callback-data";

export const viewUserFoldersData = createCallbackData("viewUserFolders", {
  userId: String,
});
