import { Bot, Composer } from "grammy";
import schedule from "node-schedule";
import { Context, RepositoryType } from "../context.js";
import { postponeReminder, sendRemindersToAll } from "../services/schedule.js";
import { postponeCheckCallback } from "../callback-data/index.js";
import { logHandle } from "../helpers/logging.js";
import { deleteOldFolders } from "../services/admin/handle-view-folders.js";

export function createScheduleFeature(
  bot: Bot<Context>,
  repositories: RepositoryType,
) {
  const composer = new Composer<Context>();

  schedule.scheduleJob(
    { hour: 0, minute: 0, tz: "Europe/Moscow" },
    async () => {
      await deleteOldFolders(repositories);

      const scheduleTime = await repositories.settings.getNotificationTime();
      const [hour, minute] = scheduleTime.split(":");
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
