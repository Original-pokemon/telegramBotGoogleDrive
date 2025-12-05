import { createCallbackData } from "callback-data";

export const changeUserGroupData = createCallbackData("changeUserGroup", {
  userId: String,
});
