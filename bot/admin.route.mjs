export default function adminRoute(
  botInstance,
  router,
  adminPanel,
  getAllProfile,
  search,
  profile,
  promote,
  userGroup,
  updateGroup,
  requestNewUserName,
  editUserName,
  createUserFolder,
  sendReminderMessage,
  newsletterPanel,
  sendLetterText
) {
  botInstance.callbackQuery('admin', adminPanel);
  botInstance.callbackQuery(/userId_\d+/, profile);
  botInstance.callbackQuery(/promote_\d+/, promote);
  botInstance.callbackQuery(/wait_\d+/, userGroup);
  botInstance.callbackQuery(/access_\w+/, updateGroup);
  botInstance.callbackQuery(/editName_/, requestNewUserName);
  botInstance.callbackQuery(/createFolder_\d+/, createUserFolder);
  botInstance.callbackQuery(/sendReminder_\d+/, sendReminderMessage);

  botInstance.hears('Найти пользователя', search);
  botInstance.hears('Показать всех пользователей', getAllProfile);
  botInstance.hears('Сделать рассылку', newsletterPanel);

  router.route('enter_id', profile);
  router.route('enter_name', editUserName);
  router.route('enter_letter_text', sendLetterText);
}
