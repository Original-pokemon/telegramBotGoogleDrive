import { Bot, Composer } from "grammy";
import schedule from "node-schedule";
import { SCHEDULE_TIME } from "../const.js";
import { Context } from "../context.js";
import { postponeReminder, sendRemindersToAll } from "../services/schedule.js";
import UsersRepository from "../repositories/user.repository.js";
import { postponeCheckCallback } from "../callback-data/index.js";
import { logHandle } from "../helpers/logging.js";

export function createScheduleFeature(bot: Bot<Context>) {
  const composer = new Composer<Context>();

  schedule.scheduleJob({ hour: 0, minute: 0 }, async () => {
    const [hour, minute] = SCHEDULE_TIME.split(":");
    const interval = (+hour * 60 + +minute) * 60 * 1000;

    setTimeout(() => {
      sendRemindersToAll(bot, new UsersRepository());
    }, interval);
  });

  composer.callbackQuery(
    postponeCheckCallback,
    logHandle("callback-query-postpone-reminder"),
    postponeReminder,
  );

  return composer;
}
