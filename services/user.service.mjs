import retry from 'async-retry';
import { InlineKeyboard } from 'grammy';
import _ from 'lodash';

import { END_MSG_TEXT, Options } from '../const.mjs';
import { deleteMessage } from '../utils.mjs';

const sendEndMessage = async (context) => {
  const markup = {
    reply_markup: new InlineKeyboard()
      .text('Показать все фото', 'showPhotos')
      .row()
      .text('Отправить проверяющему', 'sendPhotos'),
  };

  try {
    delete context.session.lastMessageDate;
    context.session.scene = 'end_msg';

    await context.reply(END_MSG_TEXT, markup);

    console.log(`${context.session.user.Name} :>> Send end message`);
  } catch (error) {
    console.error(`Error sending end message: ${error.message}`);
  }
};

const sendQestionMessage = async (context, questionNumber) => {
  const { questions, user } = context.session;
  const question = questions[questionNumber];
  const markup = {
    reply_markup: new InlineKeyboard().text('Отсутсвует', 'skip_photo'),
  };
  try {
    await (question.Require
      ? context.reply(question.Text, markup)
      : context.reply(question.Text));

    console.log(`${user.Name} :>> Send question: ${question.Name}`);
  } catch (error) {
    console.error(`Error in sendQestionMsg: ${error}`);
  }
};

async function sendNextMessage(context, answersLength, questionsLength) {
  // Send next question or end message
  if (answersLength > questionsLength) return;

  await (questionsLength === answersLength
    ? sendEndMessage(context)
    : sendQestionMessage(context, answersLength));
}

function userPanel(QuestionRepository) {
  return async (context) => {
    const { Group } = context.session.user;
    const { session } = context;
    session.answers = [];
    session.lastMessageDate = undefined;

    try {
      session.questions = await QuestionRepository.getQuestions(Group);
      session.scene = 'sending_photo';
      // check required parameters and send message
      await deleteMessage(context);
      await sendQestionMessage(context, 0);
    } catch (error) {
      if (session.questions.length <= 0) {
        console.log('В базе нету вопросов');
        sendEndMessage(context);
      } else {
        console.error(`user.service > userPanel ${error}`);
      }
    }
  };
}

// Helper function to check if user took too long to answer
const checkAnswerTime = ({ session, update }) =>
  session.lastMessageDate <= update.message.date - 5 * 60;

async function handleRestartCheck(context, QuestionRepository, message = '') {
  const { Group, Name } = context.session.user;

  context.session.questions = await QuestionRepository.getQuestions(Group);
  context.session.answers = [];
  context.session.lastMessageDate = undefined;

  try {
    // Notify user and reset session data
    if (message) {
      await context.reply(message);
    }

    await sendQestionMessage(context, 0);
    console.log(`${Name} :>> Restart check`);
  } catch (error) {
    // Handle error by retrying the function
    console.error(`Error in handleAnswerTimeExceeded: ${error}`);
  }
}

// Helper function to handle callback query
async function handleCallbackQuery(context) {
  const { answers, questions } = context.session;
  await deleteMessage(context);
  answers.push(undefined);
  // Send next question or end message
  sendNextMessage(context, answers.length, questions.length);
}

// Helper function to handle photo message
async function handlePhotoMessage(context, QuestionRepository) {
  const { answers, questions } = context.session;
  if (answers.length === questions.length) return;

  if (checkAnswerTime(context)) {
    await handleRestartCheck(
      context,
      QuestionRepository,
      'Вы не уложились в 5 минут.\nПройдите проверку заново'
    );
    return;
  }

  const fileName = questions[answers.length].Name;
  const messageDate = context.update.message.date;

  context.session.lastMessageDate = messageDate;
  // Get file with retry on HttpError
  try {
    const file = await context.getFile();

    const urlFile = file.getUrl();

    answers.push({
      fileName,
      urlFile,
      id: file.file_id,
    });

    // Send next question or end message
    sendNextMessage(context, answers.length, questions.length);
  } catch (error) {
    console.error('user.service >> handlePhotoMessage:', error);
  }
}

function getPhotoAnswer(QuestionRepository) {
  return async (context) => {
    const { message, callback_query: callbackQuery } = context.update;

    if (!message?.photo && !callbackQuery?.data) return;

    try {
      // Check if user interrupted previous check
      if (!message?.photo && callbackQuery?.data !== 'skip_photo') {
        await deleteMessage(context);
        await handleRestartCheck(context, QuestionRepository);
        return;
      }

      // Check if scene is correct
      if (context.session.scene !== 'sending_photo') {
        await deleteMessage(context);
        return;
      }

      // Handle callback query
      if (context.callbackQuery?.data) {
        await handleCallbackQuery(context);
        return;
      }

      // Handle photo message
      await handlePhotoMessage(context, QuestionRepository);
    } catch (error) {
      console.error(`user.service > getPhotoAnswer ${error}`);
    }
  };
}

function showPhotos() {
  return async (context) => {
    const { answers } = context.session;
    try {
      if (answers.length === 0) return await deleteMessage(context);

      const promises = answers.map(async (photo, index) => {
        if (photo) {
          await context.replyWithPhoto(photo.id, {
            caption: photo.fileName,
            reply_markup: new InlineKeyboard().text(
              'Изменить',
              `editPhoto_${index}`
            ),
          });
        }
      });

      await Promise.all(promises);

      await context.reply('Отправить проверяющему все как есть', {
        reply_markup: new InlineKeyboard().text('Отправить', `sendPhotos`),
      });

      await deleteMessage(context);

      return true;
    } catch (error) {
      console.error(`user.service > showPhotos ${error}`);
      return false;
    }
  };
}

function editPhotoPanel() {
  return async (context) => {
    try {
      await deleteMessage(context);
      if (context.session.scene !== 'end_msg') return;
      const { answers } = context.session;
      const answersIndex = context.update.callback_query.data.split('_')[1];
      const photo = answers[answersIndex];

      context.session.scene = 'edit_photo';
      context.session.answersIndex = answersIndex;
      await context.reply(`Отправьте новое фото: ${photo.fileName}`);
    } catch (error) {
      console.error(`user.service > editPhoto ${error}`);
    }
  };
}

function editPhoto() {
  return async (context) => {
    try {
      if (context.callbackQuery?.data === 'startCheck') {
        context.session.scene = '';
      }

      if (!context.update.message?.photo) return await deleteMessage(context);

      const { answers } = context.session;
      const { answersIndex } = context.session;
      const photo = answers[answersIndex];
      const file = await context.getFile();

      photo.id = file.file_id;
      photo.urlFile = file.getUrl();

      await sendEndMessage(context);

      return true;
    } catch (error) {
      console.error(`user.service > editPhoto ${error}`);
      return false;
    }
  };
}

async function sendPhotosToDrive(GoogleRepository, photos, folderId) {
  const promises = [];
  _.each(photos, async (photo) => {
    await retry(async () => {
      const promise = GoogleRepository.upload({
        urlPath: photo.urlFile,
        fileName: photo.fileName,
        parentIdentifiers: folderId,
      });

      promises.push(promise);
    }, Options);

    await Promise.allSettled(promises);

    return true;
  });
}

function saveToGoogle(GoogleRepository) {
  return async (context) => {
    const userFolder = context.session.user.UserFolder;
    const { answers } = context.session;
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    try {
      if (!answers?.length) await deleteMessage(context);

      const folderId = await GoogleRepository.makeFolder({
        folderName: `${day}-${month}-${year}`,
        parentIdentifiers: userFolder,
      });

      await context.editMessageText('Фотографии отправляются ☑');

      await sendPhotosToDrive(GoogleRepository, _.compact(answers), folderId);
      await context.editMessageText('Все фотографии отправленны ✅');

      context.session.scene = '';

      delete context.session.questions;
      delete context.session.answers;
      delete context.session.debounceFunc;

      return true;
    } catch (error) {
      if (error) {
        console.error(`user.service > saveToGoogle ${error}`);
        return false;
      }
      return true;
    }
  };
}

export {
  editPhoto,
  editPhotoPanel,
  getPhotoAnswer,
  saveToGoogle,
  showPhotos,
  userPanel,
};
