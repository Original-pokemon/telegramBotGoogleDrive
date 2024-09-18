import { createCallbackData } from "callback-data";

export const updateUserGroupData = createCallbackData("updateUserGroup", {
  userId: String,
  azsType: String,
});
