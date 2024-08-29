import { InlineKeyboard } from 'grammy';

import { UserGroup } from '../../const.js';
import { START_MSG } from '../const.js'
import { Context } from '../context.js';

export default async function start(ctx: Context) {
  ctx.logger.trace("Start command invoked");

  try {
    let buttons = new InlineKeyboard();
    ctx.logger.debug("InlineKeyboard instance created");

    if (ctx.session.isAdmin) {
      ctx.logger.debug("User is admin, adding admin panel button");
      buttons = buttons
        .text('Открыть панель администратора', UserGroup.Admin)
        .row();
    } else {
      ctx.logger.debug("User is not an admin, no admin panel button added");
    }

    await ctx.reply(START_MSG, {
      reply_markup: buttons,
    });
    ctx.logger.debug("Start message sent successfully");

  } catch (error) {
    ctx.logger.error(`Error in start.service: ${error instanceof Error ? error.message : error}`);
  }
};

