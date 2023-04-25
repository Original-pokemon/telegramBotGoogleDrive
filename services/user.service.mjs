import { InlineKeyboard } from 'grammy'
import retry from 'async-retry';
import { options } from '../variables.mjs'

const MSG_TEXT = `Вы отправили все требуемые фотографии!👍\n\n` +
  `Проверьте все фото перед отправкой🧐\n\n` +
  `❗Если вы допустили ошибку можете изменить отправленную фотографию\n` +
  `Для этого нажмите "Показать все фото" и выберите фото, которое надо заменить❗`

const deleteMessage = async (ctx) => {
  try {
    await ctx.deleteMessage();
  } catch (err) {
  }
}

function userPanel(QuestionRepository) {
  return async (ctx) => {
    const group = ctx.session.user.Group
    ctx.session.photo = []
    ctx.session.customData = []
    try {
      const questions = await QuestionRepository.getQuestions(group)
      ctx.session.questions = questions
      ctx.session.scene = 'sending_photo'
      // check required parameters and send message
      await sendQestionMsg(ctx, 0)
      await deleteMessage(ctx);
    } catch (err) {
      if (questions.length <= 0) {
        console.log('В базе нету вопросов')
        sendEndMsg(ctx)
      } else {
        console.error('user.service > userPanel ' + err)
      }
    }
  }
}

// Helper function to check if user took too long to answer
const checkAnswerTime = (ctx, customData) => (customData.at(-1) <= ctx.update.message.date - 5 * 60) ? true : false

async function handleAnswerTimeExceeded(ctx, answers) {
  try {
    // Notify user and reset session data
    await retry(async () => await ctx.reply('Вы не уложились в 5 минут.\nПройдите проверку заново'), options)
    answers = []
    ctx.session.customData = []

    // Send first question again
    await retry(async () => await sendQestionMsg(ctx, 0), options)
    console.log('Answer time exceeded');
  } catch (err) {
    // Handle error by retrying the function
    console.log(`Error in handleAnswerTimeExceeded: ${err}`)
  }
}

const debounce = (callback, timeoutDelay = 500) => {
  let timeoutId;

  return (...rest) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => callback.apply(this, rest), timeoutDelay);
  };
}

const sendEndMsg = async (ctx) => {
  try {
    ctx.session.customData = []
    ctx.session.scene = 'end_msg'
    await retry(async () => await ctx.reply(MSG_TEXT, {
      reply_markup: new InlineKeyboard()
        .text('Показать все фото', 'showPhotos')
        .row()
        .text('Отправить проверяющему', 'sendPhotos'),
    }))
  } catch (err) {
    console.log(`Error sending end message: ${err.message}`);
  }
}

const sendQestionMsg = async (ctx, questionNumber) => {
  const questions = ctx.session.questions
  const question = questions[questionNumber]

  try {
    console.log(question.Name)
    await retry(async () => {
      if (question.Require) {
        await ctx.reply(ctx.session.questions[questionNumber].Text, {
          reply_markup: new InlineKeyboard()
            .text('Отсутсвует', 'skip_photo')
        })
      } else {
        await ctx.reply(question.Text)
      }
    }, options)
  } catch (err) {
    console.log(`Error in sendQestionMsg: ${err}`)
  }
}

async function sendNextMsg(ctx, answersLength, questionsLength) {
  // Send next question or end message
  if (answersLength > questionsLength) return

  if (questionsLength === answersLength) {
    await sendEndMsg(ctx)
  } else {
    await sendQestionMsg(ctx, answersLength)
  }
}

const sendNextMsgDebounced = debounce(sendNextMsg);

// Helper function to handle callback query
async function handleCallbackQuery(ctx, answers, questions) {
  await deleteMessage(ctx);
  answers.push(null)
  // Send next question or end message
  sendNextMsg(ctx, answers, questions)
}

// Helper function to handle photo message

async function handlePhotoMessage(ctx, answers, questions) {
  if (answers.length === questions.length) return

  const fileName = questions[answers.length].Name //trow error
  const msgDate = ctx.update.message.date
  const customData = ctx.session.customData

  if (checkAnswerTime(ctx, customData)) {
    handleAnswerTimeExceeded(ctx, answers)
    return
  }

  customData.push(msgDate)
  // Get file with retry on HttpError
  try {
    const file = await retry(async () => await ctx.getFile(), options)
    const urlFile = file.getUrl()
    answers.push({
      fileName,
      urlFile,
      id: file.file_id,
    })

    // Send next question or end message 
    sendNextMsgDebounced(ctx, answers.length, questions.length)
  } catch (err) {
    console.error('user.service >> handlePhotoMessage: ', err);
  }
}

function getPhotoAnswer() {
  return async (ctx) => {
    if (!ctx.update.message?.photo && !ctx.callbackQuery?.data) return null

    try {
      // Check if user interrupted previous check
      if (!ctx.update.message?.photo && ctx.callbackQuery?.data !== 'skip_photo') {
        ctx.session.scene = ''
        await ctx.reply('Вы прервали прошлую проверку😔\n\nНажмите кнопку "Да" ещё раз🙏')
        return
      }

      // Check if scene is correct
      if (ctx.session.scene !== 'sending_photo') return await deleteMessage(ctx);

      // Get questions, answers, and custom data from session
      const questions = ctx.session.questions
      const answers = ctx.session.photo

      // Handle callback query
      if (ctx.callbackQuery?.data) {
        await handleCallbackQuery(ctx, answers, questions)
        return
      }

      // Handle photo message
      await handlePhotoMessage(ctx, answers, questions)
    } catch (err) {
      console.error('user.service > getPhotoAnswer ' + err)
    }
  }
}

function showPhotos() {
  return async (ctx) => {
    try {
      if (ctx.session.photo.length === 0) return await deleteMessage(ctx);

      const promises = ctx.session.photo.map(async (e, i) => {
        if (e) {
          await ctx.replyWithPhoto(e.id, {
            caption: e.fileName,
            reply_markup: new InlineKeyboard().text('Изменить', `editPhoto_${i}`),
          })
        }
      })

      await Promise.all(promises)

      await ctx.reply('Отправить проверяющему все как есть', {
        reply_markup: new InlineKeyboard().text('Отправить', `sendPhotos`),
      })

      await deleteMessage(ctx);

    } catch (err) {
      console.error('user.service > showPhotos ' + err)
    }
  }
}

function editPhotoPanel() {
  return async (ctx) => {
    try {
      await deleteMessage(ctx);
      if (ctx.session.scene !== 'end_msg') return
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
      if (!ctx.update.message?.photo) return await deleteMessage(ctx)

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

    const userFolder = ctx.session.user.UserFolder
    const answers = ctx.session.photo
    const date = new Date()

    try {
      if (answers.length === 0) return await deleteMessage(ctx);

      const folderId = await GoogleRepository.makeFolder({
        folderName: `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`,
        parentIdentifiers: userFolder,
      })
      await ctx.editMessageText('Фотографии отправляются ☑')
      await sendPhotosToDrive(GoogleRepository, answers, folderId)

      await ctx.editMessageText('Все фотографии отправленны ✅')
      ctx.session.photo = []
      ctx.session.scene = ''
    } catch (err) {
      if (err) {
        console.error('user.service > saveToGoogle ' + err)
      }
    }
  }
}

async function sendPhotosToDrive(GoogleRepository, arr, folderId) {
  const MAX_SIMULTANEOUS_REQUESTS = 10
  const MAX_RETIES = 10
  let retries = 0

  while (retries < MAX_RETIES) {
    try {
      const promises = []
      let simultaneousRequests = 0

      for (let i = 0; i < arr.length; i++) {
        const e = arr[i]

        if (e) {
          const promise = GoogleRepository.upload({
            urlPath: e.urlFile,
            fileName: e.fileName,
            parentIdentifiers: folderId,
          })
          promises.push(promise)
          arr[i] = null
          simultaneousRequests++

          if (simultaneousRequests >= MAX_SIMULTANEOUS_REQUESTS) {
            await Promise.allSettled(promises)
            promises.length = 0
            simultaneousRequests = 0
          }
        }
      }

      if (promises.length > 0) {
        await Promise.allSettled(promises)
      }

      return true
    } catch (err) {
      console.error('user.service > sendPhotosToDrive: ' + err)
      retries++
      await new Promise(resolve => setTimeout(resolve, 1000 * retries))
    }
  }

  throw new Error('Error: max retries exceeded')
}

export {
  userPanel,
  getPhotoAnswer,
  showPhotos,
  editPhoto,
  editPhotoPanel,
  saveToGoogle,
}
