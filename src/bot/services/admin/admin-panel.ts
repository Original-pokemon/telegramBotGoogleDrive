import { Context } from "#root/bot/context.js";
import { Keyboard } from "grammy";
import { adminPanelTexts } from "./text.js";

function createAdminKeyboard(): Keyboard {
  return new Keyboard()
    .text(adminPanelTexts.SHOW_ALL_USERS)
    .text(adminPanelTexts.FIND_USER)
    .row()
    .text(adminPanelTexts.SET_NOTIFICATION_TIME)
    .text(adminPanelTexts.CONFIGURE_QUESTIONS)
    .row()
    .text(adminPanelTexts.SEND_BROADCAST)
    .resized();
}
export async function adminPanel(ctx: Context) {
  ctx.logger.trace("Admin panel command invoked");

  try {
    const keyboard = createAdminKeyboard();
    ctx.logger.debug("Admin keyboard created");

    await ctx.reply(adminPanelTexts.MANAGE_USERS, {
      reply_markup: keyboard,
    });

    ctx.logger.debug("Admin panel message sent successfully");
  } catch (error) {
    ctx.logger.error(`Error in admin.service > adminPanel: ${error instanceof Error ? error.message : error}`);
  }
};