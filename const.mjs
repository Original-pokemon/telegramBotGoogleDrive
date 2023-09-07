/**
 * @constant{string} The time at which the reminder is sent
 */
const Options = {
  retries: 5,
  minTimeout: 1000,
  maxTimeout: 5000,
  onRetry: (error) => console.log(`Error: ${error.message}. Retrying...`),
};

/**
 * @constant{string} The time at which the reminder is sent
 */
const SHEDULE_TIME = '10:00';

/**
 * @constant{string}
 */
const REMINDER_MSG_TEXT =
  'Приветствую! Необходимо пройти проверку стандартов обслуживания.👋\n\n' +
  'У вас есть 5 минут на то, что бы сделать фото и отправить его.⏳\n\n' +
  'Вы готовы приступить❔';

/**
 * @constant{string}
 */
const END_MSG_TEXT =
  `Вы отправили все требуемые фотографии!f👍\n\n` +
  `Проверьте все фото перед отправкой🧐\n\n` +
  `❗Если вы допустили ошибку можете изменить отправленную фотографию\n` +
  `Для этого нажмите "Показать все фото" и выберите фото, которое надо заменить❗`;

const UserGroup = {
  Admin: 'admin',
  WaitConfirm: 'waitConfirm',
  Azs: 'azs',
  AzsWithStore: 'azsWithStore',
  Gpn: 'gpn',
};

export { END_MSG_TEXT, Options, REMINDER_MSG_TEXT, SHEDULE_TIME, UserGroup };
