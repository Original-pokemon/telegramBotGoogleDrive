import { InlineKeyboard } from 'grammy';

import { UserGroup } from '../../const.js';
import { START_MSG } from '../const.js'

export default function start() {
  return async (context) => {
    try {
      let buttons = new InlineKeyboard();
      if (context.session.isAdmin || context.session.isTopAdmin) {
        buttons = buttons
          .text('Открыть панель администратора', UserGroup.Admin)
          .row();
      }
      await context.reply(START_MSG,
        {
          reply_markup: buttons,
        }
      );
    } catch (error) {
      console.error(`start.service: \n${error}`);
    }
  };
}
