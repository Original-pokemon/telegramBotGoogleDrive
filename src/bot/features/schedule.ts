import { Bot, Composer } from 'grammy';
import { SCHEDULE_TIME } from '../const.js';
import { Context } from '../context.js';
import { sendRemindersToAll, sendReminderToOne } from '../services/schedule.js';
import schedule from 'node-schedule';
import UsersRepository from '../repositories/user.repository.js';
import { postponeCheckCallback } from '../callback-data/index.js';

export function createScheduleFeature(bot: Bot<Context>) {
  const composer = new Composer<Context>();

  schedule.scheduleJob({ hour: 0, minute: 0 }, async () => {
    const [hour, minute] = SCHEDULE_TIME.split(':');
    const interval = (+hour * 60 + +minute) * 60 * 1000;

    setTimeout(() => {
      sendRemindersToAll(bot, new UsersRepository());
    }, interval);
  });

  composer.callbackQuery(postponeCheckCallback, sendReminderToOne);

  return composer;
}