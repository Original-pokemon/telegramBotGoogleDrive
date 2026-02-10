import { Bot, Composer } from "grammy";
import schedule from "node-schedule";
import { Context, RepositoryType } from "../context.js";
import { postponeReminder, sendRemindersToAll } from "../services/schedule.js";
import { postponeCheckCallback } from "../callback-data/index.js";
import { logHandle } from "../helpers/logging.js";
import { deleteOldFolders } from "../services/admin/handle-view-folders.js";
import {
  scheduleEvents,
  NOTIFICATION_TIME_CHANGED,
} from "../services/schedule-events.js";

const NOTIFICATION_JOB_NAME = "sendReminders";

async function rescheduleNotificationJob(
  bot: Bot<Context>,
  repositories: RepositoryType,
) {
  const existingJob = schedule.scheduledJobs[NOTIFICATION_JOB_NAME];
  if (existingJob) {
    existingJob.cancel();
  }

  const scheduleTime = await repositories.settings.getNotificationTime();
  const [hour, minute] = scheduleTime.split(":");

  schedule.scheduleJob(
    NOTIFICATION_JOB_NAME,
    { hour: +hour, minute: +minute, tz: "Europe/Moscow" },
    () => {
      sendRemindersToAll(bot, repositories.users);
    },
  );
}

export function createScheduleFeature(
  bot: Bot<Context>,
  repositories: RepositoryType,
) {
  const composer = new Composer<Context>();

  rescheduleNotificationJob(bot, repositories);

  schedule.scheduleJob(
    { hour: 0, minute: 0, tz: "Europe/Moscow" },
    async () => {
      await deleteOldFolders(repositories);
      await rescheduleNotificationJob(bot, repositories);
    },
  );

  scheduleEvents.on(NOTIFICATION_TIME_CHANGED, () => {
    rescheduleNotificationJob(bot, repositories);
  });

  composer.callbackQuery(
    postponeCheckCallback,
    logHandle("callback-query-postpone-reminder"),
    postponeReminder,
  );

  return composer;
}
