import { SCHEDULE_TIME } from '../const.js';

export default function scheduleRoute(botInstance, schedule, sendReminder) {
  schedule.scheduleJob({ hour: 0, minute: 0 }, async () => {
    // const sheduleTime = undefined; // getDataBase TODO

    const [hour, minute] = SCHEDULE_TIME.split(':');

    const intervale = (+hour * 60 + +minute) * 60 * 1000;
    setTimeout(() => {
      sendReminder();
    }, intervale);
  });
  botInstance.callbackQuery('postponeСheck', sendReminder);
}
