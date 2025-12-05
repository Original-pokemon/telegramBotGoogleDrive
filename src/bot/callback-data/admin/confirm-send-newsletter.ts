import { createCallbackData } from "callback-data";

export const confirmSendNewsletterData = createCallbackData(
  "confirmSendNewsletter",
  {
    action: String, // "confirm" or "cancel"
  },
);
