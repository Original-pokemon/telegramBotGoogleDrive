import { createCallbackData } from "callback-data";

export const updateNotificationTimeActionData = createCallbackData("updateTime", {
  action: String,
  hour: Number,
  minute: Number
});