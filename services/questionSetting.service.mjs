import { InlineKeyboard } from 'grammy';

function questionPanel() {
  return async (context) => {
    try {
      context.reply('Панель управленя вопросами', {
        reply_markup: new InlineKeyboard()
          .text('Создать новый вопрос', 'add_question')
          .row()
          .text('Показать все вопросы', 'show_all_questions'),
      });
    } catch (error) {
      console.error(`admin.service > questionPanel${error}`);
    }
  };
}

function showQuestionList(QuestionRepository) {
  return async (context) => {
    const questions = await QuestionRepository.getAllQuestions();
    const markup = new InlineKeyboard();
    for (const item of questions) {
      markup.text(item.Name, `questionId_${item.Id}`).row();
    }
    context.editMessageText('Все вопросы', { reply_markup: markup });
  };
}

function questionProfile(QuestionRepository) {
  return async (context) => {
    const id = context.update.callback_query.data.split('_')[1];
    const question = await QuestionRepository.getQuestion(id);
    let questionGroup;

    switch (question.Group) {
      case 'azs': {
        questionGroup = 'Для киосков';
        break;
      }
      case 'azsWithStore': {
        questionGroup = 'Для АЗС с магазином';
        break;
      }
      case 'all': {
        questionGroup = 'Для всех АЗС';
        break;
      }
    }

    await context.editMessageText(
      `Вопрос №${id}\n` +
      `Название вопроса: ${question.Name}\n` +
      `Текст вопроса: ${question.Text}\n` +
      `Для каких АЗС: ${questionGroup}\n` +
      `Кнопка "Отсутсвует": ${question.Require === true ? 'Есть' : 'Нету'}`,
      {
        reply_markup: new InlineKeyboard()
          .text('Изменить', ` edit_question_${id}`)
          .row()
          .text('Удалить', `del_question_${id}`),
      }
    );
    context.session.question = question;
  };
}

// Define a function to handle text processing
function addQuestion(QuestionRepository) {
  return async (context) => {
    switch (context.session.scene) {
      case 'name': {
        context.session.name = context.message.text;

        context.session.scene = 'text';

        await context.reply(
          'Введите текст вопроса:\n\nК примеру - Сфотографируйте витрину(можно описать точный ракурс)'
        );
        break;
      }

      case 'text': {
        context.session.text = context.message.text;

        context.session.scene = 'require';

        const Options = [
          ['Да', 'requireAtribute_true'],
          ['Нет', 'requireAtribute_false'],
        ];

        // Create the inline keyboard markup with the Options
        const markup = {
          inline_keyboard: Options.map((o) => [
            { text: o[0], callback_data: o[1] },
          ]),
        };

        await context.reply('Добавить кнопку "Отсутсвует"?', {
          reply_markup: markup,
        });

        break;
      }

      case 'require': {
        const questionName = context.session.name;
        const questionGroup = context.session.azs;
        const questionText = context.session.text;
        const questionRequired =
          context.update.callback_query.data.split('_')[1];

        await QuestionRepository.addQuestion(
          questionName,
          questionText,
          questionGroup,
          questionRequired
        );

        await context.editMessageText('Вопрос успешно добавлен в базу данных!');

        context.session.scene = '';
        delete context.session.group;
        delete context.session.name;
        delete context.session.text;

        break;
      }

      default: {
        // Create the keyboard with two buttons
        const keyboard = {
          reply_markup: new InlineKeyboard()
            .text('Для АЗС с магазином', 'azs_with_shop')
            .row()
            .text('Для АЗС без магазина', 'azs_without_shop')
            .row()
            .text('Для всех АЗС', 'azs_all'),
        };

        // Ask the user for the group name and provide the keyboard
        await context.editMessageText('Выбирете азс:', keyboard);
        break;
      }
    }
  };
}

// Listen for button presses and call the handleText function
function checkAzsType() {
  return async (context) => {
    try {
      // Get the button data from the callback query
      const buttonData = context.callbackQuery.data;

      // Handle the button press based on the data
      switch (buttonData) {
        case 'azs_with_shop': {
          // Set the user session to 'azs_with_shop'
          context.session.azs = Group.AzsWithStore;
          break;
        }

        case 'azs_without_shop': {
          // Set the user session to 'azs_without_shop'
          context.session.azs = Group.Azs;
          break;
        }

        default: {
          context.session.azs = 'all';
          break;
        }
      }

      context.session.scene = 'name';
      await context.editMessageText(
        'Введите название вопроса:\n\nНазвание должно отражать то, что будет на фото\n\nК примеру - Витрина '
      );
    } catch (error) {
      console.error('Ошибка в функции checkAzsType:', error);
      // Handle the error here
    }
  };
}

function deleteQuestion(QuestionRepository) {
  return async (context) => {
    try {
      const id = context.update.callback_query.data.split('_')[2];
      await QuestionRepository.deleteQuestion(id);
      await context.editMessageText('Вопрос успешно удален из базы данных!');
      delete context.session.question;
    } catch (error) {
      console.error('Ошибка в функции deleteQuestion:', error);
      await context.reply('Произошла ошибка при удалении вопроса.');
    }
  };
}

function sendEditMessagePanel() {
  return async (context) => {
    const Options = [
      ['Изменить название', 'update_name'],
      ['Изменить текст', 'update_text'],
      ['Изменить получателя', 'update_group'],
    ];

    // Create the inline keyboard markup with the Options
    const markup = {
      inline_keyboard: Options.map((o) => [
        { text: o[0], callback_data: o[1] },
      ]),
    };

    // Send the message with the inline keyboard markup
    try {
      // Send the message with the inline keyboard markup
      await context.editMessageText('Выберите действие:', {
        reply_markup: markup,
      });
    } catch (error) {
      console.error('Ошибка в функции sendEditMessagePanel:', error);
      // Можно отправить сообщение пользователю о том, что произошла ошибка
      await context.reply('Произошла ошибка при обработке команды');
    }
  };
}

function redirectUpdateQuestion() {
  return async (context) => {
    try {
      const buttonData = context.callbackQuery.data.split('_')[1];
      switch (buttonData) {
        case 'name': {
          context.session.scene = 'updateQuestion_name';
          await context.editMessageText('Введите новое название вопроса:');
          break;
        }
        case 'text': {
          context.session.scene = 'updateQuestion_text';
          await context.editMessageText('Введите новый текст вопроса:');
          break;
        }
        case 'group': {
          context.session.scene = 'updateQuestion_group';
          const keyboard = {
            reply_markup: new InlineKeyboard()
              .text('Для АЗС с магазином', 'azs_with_shop')
              .row()
              .text('Для АЗС без магазина', 'azs_without_shop')
              .row()
              .text('Для всех АЗС', 'azs_all'),
          };
          await context.editMessageText('Выбирете азс:', keyboard);
          break;
        }
        default: {
          throw new Error('Неизвестный тип кнопки');
        }
      }
    } catch (error) {
      console.error('Ошибка в функции redirectUpdateQuestion:', error);
      // Можно отправить сообщение пользователю о том, что произошла ошибка
      await context.reply('Произошла ошибка при обработке команды');
    }
  };
}

function updateQuestionData(QuestionRepository) {
  return async (context) => {
    const { question } = context.session;
    const scene = context.session.scene.split('_')[1];
    switch (scene) {
      case 'name': {
        const questionName = context.message.text;
        question.Name = questionName;
        break;
      }
      case 'text': {
        const questionText = context.message.text;
        question.Text = questionText;
        break;
      }
      case 'group': {
        const questionGroup =
          context.callbackQuery.data === 'azs_with_shop'
            ? Group.AzsWithStore
            : Group.Azs;
        question.Group = questionGroup;
        break;
      }
      default: {
        return;
      }
    }
    try {
      await QuestionRepository.updateQuestion(
        question.Id,
        question.Name,
        question.Text,
        question.Group
      );
      scene === 'group'
        ? await context.editMessageText('Данные вопроса успешно обновлены')
        : await context.reply('Данные вопроса успешно обновлены');
      context.session.scene = '';
    } catch (error) {
      console.error(error);
      await context.reply('Не удалось обновить данные вопроса');
    }
  };
}

export {
  addQuestion,
  checkAzsType,
  deleteQuestion,
  questionPanel,
  questionProfile,
  redirectUpdateQuestion,
  sendEditMessagePanel,
  showQuestionList,
  updateQuestionData,
};
