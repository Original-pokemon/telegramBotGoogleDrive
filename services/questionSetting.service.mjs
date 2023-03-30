import { InlineKeyboard } from 'grammy'

function questionPanel() {
  return async (ctx) => {
    try {
      ctx.reply('Панель управленя вопросами', {
        reply_markup: new InlineKeyboard()
          .text('Создать новый вопрос', 'add_question')
          .row()
          .text('Показать все вопросы', 'show_all_questions'),
      })
    } catch (err) {
      console.error('admin.service > questionPanel' + err)
    }
  }
}

function showQuestionList(QuestionRepository) {
  return async (ctx) => {
    const questions = await QuestionRepository.getAllQuestions()
    const markup = new InlineKeyboard()
    questions.forEach((item) => {
      markup.text(item.Name, `questionId_${item.Id}`).row()
    })
    ctx.editMessageText('Все вопросы', { reply_markup: markup })
  }
}

function questionProfile(QuestionRepository) {
  return async (ctx) => {
    const id = ctx.update.callback_query.data.split('_')[1]
    const question = await QuestionRepository.getQuestion(id)
    let questionGroup

    switch (question.Group) {
      case 'azs':
        questionGroup = 'Для киосков'
        break
      case 'azsWithStore':
        questionGroup = 'Для АЗС с магазином'
        break
      case 'all':
        questionGroup = 'Для всех АЗС'
        break
    }

    await ctx.editMessageText(
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
    )
    ctx.session.question = question
  }
}

// Define a function to handle text processing
function addQuestion(QuestionRepository) {
  return async (ctx) => {
    switch (ctx.session.scene) {
      case 'name':
        ctx.session.name = ctx.message.text

        ctx.session.scene = 'text'

        await ctx.reply('Введите текст вопроса:\n\nК примеру - Сфотографируйте витрину(можно описать точный ракурс)')
        break

      case 'text':
        ctx.session.text = ctx.message.text

        ctx.session.scene = 'require'

        const options = [
          ['Да', 'requireAtribute_true'],
          ['Нет', 'requireAtribute_false'],
        ]

        // Create the inline keyboard markup with the options
        const markup = {
          inline_keyboard: options.map(o => [{ text: o[0], callback_data: o[1] }])
        }

        await ctx.reply('Добавить кнопку "Отсутсвует"?', { reply_markup: markup })

        break

      case 'require':
        const questionName = ctx.session.name
        const questionGroup = ctx.session.azs
        const questionText = ctx.session.text
        const questionRequired = ctx.update.callback_query.data.split('_')[1]

        await QuestionRepository.addQuestion(questionName, questionText, questionGroup, questionRequired)

        await ctx.editMessageText('Вопрос успешно добавлен в базу данных!')

        ctx.session.scene = ''
        delete ctx.session.group
        delete ctx.session.name
        delete ctx.session.text

        break

      default:
        // Create the keyboard with two buttons
        const keyboard = {
          reply_markup: new InlineKeyboard()
            .text('Для АЗС с магазином', 'azs_with_shop')
            .row()
            .text('Для АЗС без магазина', 'azs_without_shop')
            .row()
            .text('Для всех АЗС', 'azs_all'),
        }

        // Ask the user for the group name and provide the keyboard
        await ctx.editMessageText('Выбирете азс:', keyboard)
        break
    }
  }
}

// Listen for button presses and call the handleText function
function checkAzsType() {
  return async (ctx) => {
    try {
      // Get the button data from the callback query
      const buttonData = ctx.callbackQuery.data

      // Handle the button press based on the data
      switch (buttonData) {
        case 'azs_with_shop':
          // Set the user session to 'azs_with_shop'
          ctx.session.azs = 'azsWithStore'
          break

        case 'azs_without_shop':
          // Set the user session to 'azs_without_shop'
          ctx.session.azs = 'azs'
          break

        default:
          ctx.session.azs = 'all'
          break
      }

      ctx.session.scene = 'name'
      await ctx.editMessageText('Введите название вопроса:\n\nНазвание должно отражать то, что будет на фото\n\nК примеру - Витрина ')
    } catch (err) {
      console.error('Ошибка в функции checkAzsType:', err)
      // Handle the error here
    }
  }
}


function deleteQuestion(QuestionRepository) {
  return async (ctx) => {
    try {
      const id = ctx.update.callback_query.data.split('_')[2]
      await QuestionRepository.deleteQuestion(id)
      await ctx.editMessageText('Вопрос успешно удален из базы данных!')
      delete ctx.session.question
    } catch (error) {
      console.error('Ошибка в функции deleteQuestion:', error)
      await ctx.reply('Произошла ошибка при удалении вопроса.')
    }
  }
}


function sendEditMessagePanel() {
  return async (ctx) => {
    const options = [
      ['Изменить название', 'update_name'],
      ['Изменить текст', 'update_text'],
      ['Изменить получателя', 'update_group'],
    ]

    // Create the inline keyboard markup with the options
    const markup = {
      inline_keyboard: options.map(o => [{ text: o[0], callback_data: o[1] }])
    }

    // Send the message with the inline keyboard markup
    try {
      // Send the message with the inline keyboard markup
      await ctx.editMessageText('Выберите действие:', { reply_markup: markup })
    } catch (error) {
      console.error('Ошибка в функции sendEditMessagePanel:', error);
      // Можно отправить сообщение пользователю о том, что произошла ошибка
      await ctx.reply('Произошла ошибка при обработке команды');
    }
  }
}

function redirectUpdateQuestion() {
  return async (ctx) => {
    try {
      const buttonData = ctx.callbackQuery.data.split('_')[1];
      switch (buttonData) {
        case 'name':
          ctx.session.scene = 'updateQuestion_name';
          await ctx.editMessageText('Введите новое название вопроса:');
          break;
        case 'text':
          ctx.session.scene = 'updateQuestion_text';
          await ctx.editMessageText('Введите новый текст вопроса:');
          break;
        case 'group':
          ctx.session.scene = 'updateQuestion_group';
          const keyboard = {
            reply_markup: new InlineKeyboard()
              .text('Для АЗС с магазином', 'azs_with_shop')
              .row()
              .text('Для АЗС без магазина', 'azs_without_shop')
              .row()
              .text('Для всех АЗС', 'azs_all'),
          };
          await ctx.editMessageText('Выбирете азс:', keyboard);
          break;
        default:
          throw new Error('Неизвестный тип кнопки');
      }
    } catch (error) {
      console.error('Ошибка в функции redirectUpdateQuestion:', error);
      // Можно отправить сообщение пользователю о том, что произошла ошибка
      await ctx.reply('Произошла ошибка при обработке команды');
    }
  }
}


function updateQuestionData(QuestionRepository) {
  return async (ctx) => {
    const question = ctx.session.question
    const scene = ctx.session.scene.split('_')[1]
    switch (scene) {
      case 'name':
        const questionName = ctx.message.text
        question.Name = questionName
        break
      case 'text':
        const questionText = ctx.message.text
        question.Text = questionText
        break
      case 'group':
        const questionGroup = ctx.callbackQuery.data === 'azs_with_shop' ? 'azsWithStore' : 'azs'
        question.Group = questionGroup
        break
      default:
        return
    }
    try {
      await QuestionRepository.updateQuestion(question.Id, question.Name, question.Text, question.Group)
      scene === 'group' ? await ctx.editMessageText('Данные вопроса успешно обновлены') : await ctx.reply('Данные вопроса успешно обновлены')
      ctx.session.scene = ''
    } catch (err) {
      console.error(err)
      await ctx.reply('Не удалось обновить данные вопроса')
    }
  }
}

export {
  questionPanel,
  showQuestionList,
  questionProfile,
  addQuestion,
  checkAzsType,
  deleteQuestion,
  sendEditMessagePanel,
  redirectUpdateQuestion,
  updateQuestionData
}