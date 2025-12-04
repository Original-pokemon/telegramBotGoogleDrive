import { createCallbackData } from "callback-data";

export const showUsersPageData = createCallbackData("showUsersPage", {
  group: String,
  pageIndex: Number,
});
