export function adminRoute(
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
  createUserFolder
) {
  botInstance.callbackQuery('admin', adminPanel)
  botInstance.callbackQuery(/userId_\d+/, profile)
  botInstance.callbackQuery(/promote_\d+/, promote)
  botInstance.callbackQuery(/wait_\d+/, userGroup)
  botInstance.callbackQuery(/access_\w+/, updateGroup)
  botInstance.callbackQuery(/editName_/, requestNewUserName)
  botInstance.callbackQuery(/createFolder_\d+/, createUserFolder)

  botInstance.hears('Найти пользователя', search)
  botInstance.hears('Показать всех пользователей', getAllProfile)

  router.route('enter_id', profile)
  router.route('enter_name', editUserName)

}
