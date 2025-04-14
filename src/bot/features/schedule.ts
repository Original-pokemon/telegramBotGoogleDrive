import { Bot, Composer } from "grammy";
import schedule from "node-schedule";
import { SCHEDULE_TIME } from "../const.js";
import { Context, RepositoryType } from "../context.js";
import { postponeReminder, sendRemindersToAll } from "../services/schedule.js";
import { postponeCheckCallback } from "../callback-data/index.js";
import { logHandle } from "../helpers/logging.js";
import { handleViewFolders } from "../services/admin/handle-view-folders.js";

export function createScheduleFeature(
  bot: Bot<Context>,
  repositories: RepositoryType,
) {
  const composer = new Composer<Context>();

  schedule.scheduleJob(
    { hour: 14, minute: 16, tz: "Europe/Moscow" },
    async () => {
      await handleViewFolders(repositories);

      const [hour, minute] = SCHEDULE_TIME.split(":");
      const interval = (+hour * 60 + +minute) * 60 * 1000;

      setTimeout(() => {
        sendRemindersToAll(bot, repositories.users);
      }, interval);
    },
  );

  composer.callbackQuery(
    postponeCheckCallback,
    logHandle("callback-query-postpone-reminder"),
    postponeReminder,
  );

  return composer;
}
