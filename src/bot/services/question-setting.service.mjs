import { InlineKeyboard } from 'grammy';
import _ from 'lodash';

import { UserGroup } from '../../const.js';

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
    _.each(questions, (question) => {
      if (question.Name) {
        markup.text(question.Name, `questionId_${question.Id}`).row();
      }
    });

    context.editMessageText('Все вопросы', { reply_markup: markup });
  };
}

function questionProfile(QuestionRepository) {
  return async (context) => {
    const id = context.update.callback_query.data.split('_')[1];
    const question = await QuestionRepository.getQuestion(id);
    const { Name, Text, Require, Group } = question;

    await context.editMessageText(
      `Вопрос №${id}\n
Название вопроса: ${Name}\n
Текст вопроса: ${Text}\n
Для каких АЗС: ${Group}\n
Кнопка "Отсутсвует": ${Require === true ? 'Есть' : 'Нету'}`,
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
function addQuestion(menu, QuestionRepository, GroupRepository) {
  const question = {
    name: '',
    groups: new Set(),
    text: '',
  };

  const toggleSelectGroup = (Name) => {
    if (!question.groups.delete(Name)) question.groups.add(Name);
  };

  return async (context) => {
    switch (context.session.scene) {
      case 'name': {
        question.name = context.message.text;

        context.session.scene = 'text';

        await context.reply(
          'Введите текст вопроса:\n\nК примеру - Сфотографируйте витрину(можно описать точный ракурс)'
        );
        break;
      }

      case 'text': {
        question.text = context.message.text;
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

        await context.reply('Вопрос обязательный?', {
          reply_markup: markup,
        });

        break;
      }

      case 'require': {
        const { name, groups, text } = question;
        const questionRequired =
          context.update.callback_query.data.split('_')[1];

        await QuestionRepository.addQuestion(
          name,
          text,
          [...groups].join(','),
          questionRequired
        );

        await context.editMessageText('Вопрос успешно добавлен в базу данных!');

        context.session.scene = '';

        break;
      }

      default: {
        // Create the keyboard with two buttons
        const groups = await GroupRepository.getAllGroups();
        _.each(groups, ({ Name }) => {
          if (Name !== UserGroup.Admin && Name !== UserGroup.WaitConfirm) {
            menu
              .text(
                () => (question.groups.has(Name) ? `${Name}✅` : `${Name}⛔`),
                (context_) => {
                  toggleSelectGroup(Name);
                  context_.menu.update();
                }
              )
              .row();
          }
        });

        menu.text('Сохранить', async () => {
          context.session.scene = 'name';
          await context.editMessageText(
            'Введите название вопроса:\n\nНазвание должно отражать то, что будет на фото\n\nК примеру - Витрина '
          );
        });

        // Ask the user for the group name and provide the keyboard
        await context.editMessageText(
          'Выберите типы АЗС, которые будут получать уведомление:',
          {
            reply_markup: menu,
          }
        );

        break;
      }
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
      await context.reply('Произошла ошибка при обработке команды');
    }
  };
}

function redirectUpdateQuestion(menu, GroupRepository) {
  return async (context) => {
    const toggleSelectGroup = (Name) => {
      if (!context.session.question.Group.delete(Name))
        context.session.question.Group.add(Name);
    };

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
          const groups = await GroupRepository.getAllGroups();
          context.session.question.Group = new Set(
            context.session.question.Group
          );
          _.each(groups, ({ Name }) => {
            if (Name !== UserGroup.Admin && Name !== UserGroup.WaitConfirm) {
              menu
                .text(
                  () =>
                    context.session.question.Group.has(Name)
                      ? `${Name}✅`
                      : `${Name}⛔`,
                  (context_) => {
                    toggleSelectGroup(Name);
                    context_.menu.update();
                  }
                )
                .row();
            }
          });

          menu.text(
            () =>
              context.session.scene === 'updateQuestion_group'
                ? 'Сохранить'
                : 'Подтвердить',
            async (context_) => {
              context.session.scene = 'updateQuestion_group';
              context_.menu.update();
            }
          );

          // Ask the user for the group name and provide the keyboard
          await context.editMessageText(
            'Выберите типы АЗС, которые будут получать уведомление:',
            {
              reply_markup: menu,
            }
          );

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
        console.log('question.Group :>>', question.Group);
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
        [...question.Group].join(','),
        question.Require
      );
      await (scene === 'group'
        ? context.editMessageText('Данные вопроса успешно обновлены')
        : context.reply('Данные вопроса успешно обновлены'));

      context.session.scene = '';
    } catch (error) {
      console.error(error);
      await context.reply('Не удалось обновить данные вопроса');
    }
  };
}

export {
  addQuestion,
  deleteQuestion,
  questionPanel,
  questionProfile,
  redirectUpdateQuestion,
  sendEditMessagePanel,
  showQuestionList,
  updateQuestionData,
};
