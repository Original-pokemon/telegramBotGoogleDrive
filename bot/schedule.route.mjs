export function sheduleRoute(botInstance, schedule, sendReminder) {
  schedule.scheduleJob({ hour: 16, minute: 16 }, async function () {
    const sheduleTime = '00:00' //getDataBase TODO

    const [hour, minute] = sheduleTime.split(':')
    console.log('sheduleTime :>> ', sheduleTime,)


    const intervale =
      (+hour * 60 + +minute) * 60 * 1000;
    setTimeout(() => {
      console.log('intervale :>> ', intervale);
      sendReminder()
    }, intervale)
  })
  botInstance.callbackQuery('postponeСheck', () => {
    setTimeout(() => {
      sendReminder()
    }, 5000)

  })
}