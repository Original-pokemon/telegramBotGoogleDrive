import { createCallbackData } from "callback-data";

export const openFolderData = createCallbackData("openFolder", {
  folderId: String,
});
