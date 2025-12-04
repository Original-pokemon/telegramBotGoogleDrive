import { createCallbackData } from "callback-data";

export const viewUserFoldersPageData = createCallbackData(
  "viewUserFoldersPage",
  {
    userId: String,
    pageIndex: Number,
  },
);
