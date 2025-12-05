import { createCallbackData } from "callback-data";

export const backToUserProfileData = createCallbackData("backToUserProfile", {
  userId: String,
});
