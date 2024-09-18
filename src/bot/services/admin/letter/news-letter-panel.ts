import { Context } from "#root/bot/context.js";
import { adminPanelTexts } from "../text.js";

export async function newsletterPanel(ctx: Context) {
  ctx.logger.trace("Newsletter panel command invoked");

  ctx.session.external.scene = "enter_letter_text";
  ctx.logger.debug("Session scene set to 'enter_letter_text'");

  try {
    await ctx.reply(adminPanelTexts.ENTER_LETTER_TEXT);
    ctx.logger.debug("Prompt for newsletter text sent successfully");
  } catch (error) {
    ctx.logger.error(
      `Error in admin.service > newsletterPanel: ${error instanceof Error ? error.message : error}`,
    );
  }
}
