import { Context } from "#root/bot/context.js";
import { adminPanelTexts } from "../text.js";

export async function userSearch(ctx: Context) {
  ctx.logger.trace("User search initiated");

  try {
    await ctx.reply(adminPanelTexts.ENTER_USER_ID);
    ctx.logger.debug("Prompt for user ID sent successfully");

    ctx.session.external.scene = "enter_id";
    ctx.logger.debug("Session scene set to 'enter_id'");
  } catch (error) {
    ctx.logger.error(
      `Error in admin.service > userSearch: ${error instanceof Error ? error.message : error}`,
    );
  }
}
