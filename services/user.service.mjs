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

const sendQestionMsg = async (ctx, questionNumber) => {
  if (ctx.session.questions[questionNumber].Require) {
    await ctx.reply(ctx.session.questions[questionNumber].Text, {
      reply_markup: new InlineKeyboard()
        .text('Отсутсвует', 'skip_photo')
    })
  } else {
    await ctx.reply(ctx.session.questions[questionNumber].Text)
  }
}

function userPanel(QuestionRepository) {
  return async (ctx) => {
    const group = ctx.session.user.Group
    try {
      const questions = await QuestionRepository.getQuestions(group)
      ctx.session.questions = questions
      ctx.session.customData = []
      ctx.session.scene = 'sending_photo'
      // check required parameters and send message
      await sendQestionMsg(ctx, 0)
      await ctx.deleteMessage()
    } catch (err) {
      if (err == `TypeError: Cannot read properties of undefined (reading 'Text')`) {
        console.error('В базе нету вопросов')
        sendEndMsg(ctx)
      } else {
        console.error('user.service > userPanel ' + err)
      }
    }
  }
}

function getPhotoAnswer() {
  return async (ctx) => {
    try {
      if (!ctx.update.message?.photo && !ctx.callbackQuery?.data) {
        return null
      }
      if (!ctx.update.message?.photo && ctx.callbackQuery?.data !== 'skip_photo') {
        ctx.session.scene = ''
        return await ctx.reply('Вы прервали прошлую проверку😔\n\nНажмите кнопку "Да" ещё раз🙏')
      }
      if (ctx.session.scene !== 'sending_photo') {
        return await ctx.deleteMessage()
      }

      const questions = ctx.session.questions
      const answers = ctx.session.photo
      const customData = ctx.session.customData

      if (ctx.callbackQuery?.data) {
        ctx.deleteMessage()
        answers.push(false)
      } else {
        console.log('question :>> ', questions[answers.length]);
        const fileName = questions[answers.length].Name
        const file = await ctx.getFile()
        const urlFile = file.getUrl()
        const msgDate = ctx.update.message.date

        if (customData.at(-1) <= msgDate - 5 * 60) {
          ctx.session.photo = []
          ctx.session.customData = []
          await ctx.reply('Вы не уложились в 5 минут.\nПройдите проверку заново')
          return await sendQestionMsg(ctx, 0)
        } else {
          customData.push(msgDate)
        }

        answers.push({
          fileName,
          urlFile,
          id: file.file_id,
        })
      }
      if (questions.length == answers.length) {
        await sendEndMsg(ctx)
      } else {
        await sendQestionMsg(ctx, answers.length)
      }

    } catch (err) {
      console.error('user.service > getPhotoAnswer ' + err)
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
        if (e) {
          await ctx.replyWithPhoto(e.id, {
            caption: e.fileName,
            reply_markup: new InlineKeyboard().text('Изменить', `editPhoto_${i}`),
          })
        }
      })

      await Promise.all(promises)

      await ctx.deleteMessage()

      await ctx.reply('Отправить проверяющему все как есть', {
        reply_markup: new InlineKeyboard().text('Отправить', `sendPhotos`),
      })
    } catch (err) {
      console.error('user.service > showPhotos ' + err)
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
      console.error('user.service > editPhoto ' + err)
    }
  }
}

function editPhoto() {
  return async (ctx) => {
    try {
      if (!ctx.update.message?.photo) {
        ctx.deleteMessage()
        return
      }
      const answers = ctx.session.photo
      const answersIndex = ctx.session.customData
      const photo = answers[answersIndex]
      const file = await ctx.getFile()
      photo.id = file.file_id
      photo.urlFile = file.getUrl()
      await sendEndMsg(ctx)
    } catch (err) {
      console.error('user.service > editPhoto ' + err)
    }
  }
}

function saveToGoogle(GoogleRepository) {
  return async (ctx) => {
    try {
      if (ctx.session.photo.length === 0) {
        ctx.deleteMessage()
        return
      }
      const userFolder = ctx.session.user.UserFolder
      const answers = ctx.session.photo
      const date = new Date()

      const folderId = await GoogleRepository.makeFolder({
        folderName: `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`,
        parentIdentifiers: userFolder,
      })
      await ctx.editMessageText('Фотографии отправляются ☑')
      const promises = answers.map(async (e) => {
        if (e) {
          await await GoogleRepository.upload({
            urlPath: e.urlFile,
            fileName: e.fileName,
            parentIdentifiers: folderId,
          })
        }
      })

      await Promise.all(promises)

      await ctx.editMessageText('Все фотографии отправленны ✅')
      ctx.session.photo = []
      ctx.session.scene = ''
    } catch (err) {
      console.error('user.service > saveToGoogle ' + err)
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
