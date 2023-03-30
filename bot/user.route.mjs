export function userRoute(
  botInstance,
  router,
  userPanel,
  getPhoto,
  showPhotos,
  editPhotoPanel,
  editPhoto,
  saveToGoogle
) {
  botInstance.callbackQuery('startCheck', userPanel)
  botInstance.callbackQuery('showPhotos', showPhotos)
  botInstance.callbackQuery(/editPhoto_\d+/, editPhotoPanel)
  botInstance.callbackQuery('sendPhotos', saveToGoogle)

  router.route('sending_photo', getPhoto)
  router.route('edit_photo', editPhoto)
}
