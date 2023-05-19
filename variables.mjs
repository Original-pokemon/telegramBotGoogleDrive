const options = {
  reties: 5,
  minTimeout: 1000,
  maxTimeOut: 5000,
  factor: 2,
  onRetry: (err) => console.log(`Error: ${err.message}. Retrying...`)
}

const SHEDULE_TIME = '10:00'

const REMINDER_MSG_TEXT =
  'Приветствую! Необходимо пройти проверку стандартов обслуживания.👋\n\n' +
  'У вас есть 5 минут на то, что бы сделать фото и отправить его.⏳\n\n' +
  'Вы готовы приступить❔'

const END_MSG_TEXT = `Вы отправили все требуемые фотографии!👍\n\n` +
  `Проверьте все фото перед отправкой🧐\n\n` +
  `❗Если вы допустили ошибку можете изменить отправленную фотографию\n` +
  `Для этого нажмите "Показать все фото" и выберите фото, которое надо заменить❗`

export { options, REMINDER_MSG_TEXT, END_MSG_TEXT, SHEDULE_TIME }