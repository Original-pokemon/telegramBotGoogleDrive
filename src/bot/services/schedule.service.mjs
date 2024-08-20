import { InlineKeyboard } from 'grammy';

import { REMINDER_MSG_TEXT } from '../const.js';
import { deleteMessage } from '../utils.mjs';

const HOUR_WAIT = 1;

const markup = {
  reply_markup: new InlineKeyboard()
    .text('Да', 'startCheck')
    .row()
    .text('Нет', 'postponeСheck'),
};

const sendRemindersToAll = async (botInstance, UsersRepository) => {
  try {
    const users = await UsersRepository.getAllAzs();
    const promises = users.map(async (user) => {
      const id = user.Id;
      try {
        await botInstance.api.sendMessage(id, REMINDER_MSG_TEXT, markup);
      } catch (error) {
        console.error('Error sending message to user:', id, error);
      }
    });
    await Promise.all(promises);
  } catch (error) {
    console.error('Error sending reminders to all users:', error);
  }
};

const sendReminderToOne = async (context) => {
  try {
    deleteMessage(context);
    await new Promise((resolve) => {
      setTimeout(resolve, 1000 * 60 * 60 * HOUR_WAIT);
    });

    await context.reply(REMINDER_MSG_TEXT, markup);
  } catch (error) {
    console.error('Error sending reminder to user:', error);
  }
};

export default function sendReminderMessage(botInstance, UsersRepository) {
  return async (context) => {
    try {
      if (context) {
        sendReminderToOne(context);
      } else {
        sendRemindersToAll(botInstance, UsersRepository);
      }
    } catch (error) {
      console.error(`schedule.service > sendReminderMessage ${error}`);
    }
  };
}
