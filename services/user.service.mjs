import { InlineKeyboard } from 'grammy'

const sendEndMsg = async (ctx) => {
  const MSG_TEXT = `Вы отправили все требуемые фотографии!👍\n\n` +
    `Проверьте все фото перед отправкой🧐\n\n` +
    `❗Если вы допустили ошибку можете изменить отправленную фотографию\n` +
    `Для этого нажмите "Показать все фото" и выберите фото, которое надо заменить❗`

  ctx.session.customData = []
  ctx.session.scene = 'end_msg'
  await ctx.reply(MSG_TEXT, {
    reply_markup: new InlineKeyboard()
      .text('Показать все фото', 'showPhotos')
      .row()
      .text('Отправить проверяющему', 'sendPhotos'),
  })
}

function userPanel(QuestionRepository) {
  return async (ctx) => {
    const group = ctx.session.user.Group
    try {
      const questions = await QuestionRepository.getQuestions(group)
      ctx.session.questions = questions
      ctx.session.customData = []
      ctx.session.scene = 'send_photo'

      ctx.editMessageText(ctx.session.questions[0].Text)
    } catch (err) {
      if (err == `TypeError: Cannot read properties of undefined (reading 'Text')`) {
        console.error('В базе нету вопросов')
        ctx.deleteMessage
        sendEndMsg(ctx)
      } else {
        console.error('user.service > adminPanel ' + err)
      }
    }
  }
}

function getPhotoAnswer() {
  return async (ctx) => {
    if (!ctx.update.message?.photo) {
      return null
    }

    const questions = ctx.session.questions
    const answers = ctx.session.photo
    const customData = ctx.session.customData
    const fileName = questions[answers.length].Name

    try {
      const file = await ctx.getFile()
      const urlFile = file.getUrl()
      const msgDate = ctx.update.message.date

      if (customData.at(-1) <= msgDate - 5 * 60) {
        ctx.session.photo = []
        ctx.session.customData = []
        await ctx.reply('Вы не уложились в 5 минут.\nПройдите проверку заново')
        return await ctx.reply(ctx.session.questions[0].Text)
      } else {
        customData.push(msgDate)
      }

      answers.push({
        fileName,
        urlFile,
        id: file.file_id,
      })

      if (questions.length == answers.length) {
        await sendEndMsg(ctx)
      } else {
        await ctx.reply(questions[answers.length].Text)
      }
    } catch (err) {
      console.error('user.service > getPhotoAnswer' + err)
    }
  }
}

function showPhotos() {
  return async (ctx) => {
    try {
      if (ctx.session.photo.length === 0) {
        ctx.deleteMessage()
        return
      }
      const promises = ctx.session.photo.map(async (e, i) => {
        await ctx.replyWithPhoto(e.id, {
          caption: e.fileName,
          reply_markup: new InlineKeyboard().text('Изменить', `editPhoto_${i}`),
        })
      })

      await Promise.all(promises)

      await ctx.deleteMessage()

      await ctx.reply('Отправить проверяющему все как есть', {
        reply_markup: new InlineKeyboard().text('Отправить', `sendPhotos`),
      })
    } catch (err) {
      console.error('user.service > showPhotos' + err)
    }
  }
}

function editPhotoPanel() {
  return async (ctx) => {
    try {
      await ctx.deleteMessage()
      if (ctx.session.scene !== 'end_msg') {
        return
      }
      const answers = ctx.session.photo
      const answersIndex = ctx.update.callback_query.data.split('_')[1]
      const photo = answers[answersIndex]

      ctx.session.scene = 'edit_photo'
      ctx.session.customData = answersIndex
      await ctx.reply('Отправьте новое фото: ' + photo.fileName)
    } catch (err) {
      console.error('user.service > editPhoto' + err)
    }
  }
}

function editPhoto() {
  return async (ctx) => {
    if (!ctx.update.message?.photo) {
      ctx.deleteMessage()
      return
    }
    const answers = ctx.session.photo
    const answersIndex = ctx.session.customData
    const photo = answers[answersIndex]
    try {
      const file = await ctx.getFile()
      photo.id = file.file_id
      photo.urlFile = file.getUrl()
      await sendEndMsg(ctx)
    } catch (err) {
      console.error('user.service > editPhoto' + err)
    }
  }
}

function saveToGoogle(GoogleRepository) {
  return async (ctx) => {
    if (ctx.session.photo.length === 0) {
      ctx.deleteMessage()
      return
    }
    const userFolder = ctx.session.user.UserFolder
    const answers = ctx.session.photo
    const date = new Date()

    try {
      const folderId = await GoogleRepository.makeFolder({
        folderName: `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`,
        parentIdentifiers: userFolder,
      })
      await ctx.editMessageText('Фотографии отправляются ☑')
      const promises = answers.map(async (e) => {
        await await GoogleRepository.upload({
          urlPath: e.urlFile,
          fileName: e.fileName,
          parentIdentifiers: folderId,
        })
      })

      await Promise.all(promises)

      await ctx.editMessageText('Все фотографии отправленны ✅')
      ctx.session.photo = []
      ctx.session.scene = ''
    } catch (err) {
      console.error('user.service > editPhoto' + err)
    }
  }
}

export {
  userPanel,
  getPhotoAnswer,
  showPhotos,
  editPhoto,
  editPhotoPanel,
  saveToGoogle,
}
