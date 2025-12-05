import { createCallbackData } from "callback-data";

export const manageUserData = createCallbackData("manageUser", {
  userId: String,
});
