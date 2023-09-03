import { SHEDULE_TIME } from '../const.mjs';

export default function sheduleRoute(botInstance, schedule, sendReminder) {
  schedule.scheduleJob({ hour: 0, minute: 0 }, async () => {
    // const sheduleTime = undefined; // getDataBase TODO

    const [hour, minute] = SHEDULE_TIME.split(':');

    const intervale = (+hour * 60 + +minute) * 60 * 1000;
    setTimeout(() => {
      sendReminder();
    }, intervale);
  });
  botInstance.callbackQuery('postponeСheck', sendReminder);
}
