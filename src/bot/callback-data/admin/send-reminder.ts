import { createCallbackData } from "callback-data";

export const sendReminderData = createCallbackData('sendReminder', {
  userId: String,
});