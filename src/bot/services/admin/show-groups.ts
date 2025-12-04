import { selectGroupData } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { InlineKeyboard } from "grammy";
import { UserGroup } from "#root/const.js";
import { adminPanelTexts } from "./text.js";

export async function showGroups(ctx: Context) {
  ctx.logger.trace("Show groups command invoked");

  try {
    const markup = new InlineKeyboard();

    // Add buttons for each group
    for (const group of Object.values(UserGroup).sort())
      markup.text(group, selectGroupData.pack({ group })).row();

    // Add back button
    markup.text("Назад", UserGroup.Admin).row();

    ctx.logger.debug("InlineKeyboard created with group data");

    await (ctx.callbackQuery
      ? ctx.editMessageText(adminPanelTexts.SELECT_GROUP, {
          reply_markup: markup,
        })
      : ctx.reply(adminPanelTexts.SELECT_GROUP, {
          reply_markup: markup,
        }));
    ctx.logger.debug("Groups list sent successfully");
  } catch (error) {
    ctx.logger.error(
      `Error in admin.service > showGroups: ${error instanceof Error ? error.message : error}`,
    );
  }
}
