import { userIdData } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { InlineKeyboard } from "grammy";
import { adminPanelTexts } from "./text.js";
import _ from "lodash";

export async function getAllUsers(ctx: Context) {
  ctx.logger.trace("Get all users command invoked");

  try {
    const users = await ctx.repositories.users.getAllUsers();
    ctx.logger.debug(`Retrieved ${users.length} users from the database`);

    const sortedUsers = _.sortBy(users, ['Name']);
    ctx.logger.debug("Users sorted by name");

    const markup = new InlineKeyboard();

    _.each(sortedUsers, ({ name, id }) =>
      markup.text(name, userIdData.pack({ id })).row()
    );
    ctx.logger.debug("InlineKeyboard created with user data");

    await ctx.reply(adminPanelTexts.ALL_USERS, {
      reply_markup: markup,
    });
    ctx.logger.debug("All users list sent successfully");
  } catch (error) {
    ctx.logger.error(`Error in admin.service > getAllUsers: ${error instanceof Error ? error.message : error}`);
  }
};