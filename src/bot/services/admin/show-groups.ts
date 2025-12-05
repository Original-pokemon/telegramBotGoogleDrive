import { selectGroupData } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { InlineKeyboard } from "grammy";
import { addBackButton } from "#root/bot/helpers/keyboard.js";
import { UserGroup } from "#root/const.js";
import { adminPanelTexts } from "./text.js";

export async function showGroups(ctx: Context) {
  ctx.logger.trace("Show groups command invoked");

  try {
    const groups = await ctx.repositories.groups.getAllGroups();
    ctx.logger.debug(`Retrieved ${groups.length} groups from database`);

    const markup = new InlineKeyboard();

    // Add buttons for each group
    for (const { id, description } of groups)
      markup.text(description, selectGroupData.pack({ group: id })).row();

    // Add back button
    addBackButton(markup, UserGroup.Admin);

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
