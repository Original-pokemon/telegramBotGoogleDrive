import { createCallbackData } from "callback-data";

export const promoteUserData = createCallbackData("promote-user", {
  userId: String,
});