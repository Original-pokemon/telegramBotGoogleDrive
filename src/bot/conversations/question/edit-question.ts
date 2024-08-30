import { deleteQuestionData, editPanelPanelData, questionProfileData } from "#root/bot/callback-data/index.js";
import { Context, RepositoryType } from "#root/bot/context.js";
import { generateQuestionProfileText } from "#root/bot/helpers/index.js";
import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { Conversation, createConversation } from "@grammyjs/conversations";
import { Question } from "@prisma/client";
import { promptForQuestionName } from "./prompts/question-name.js";
import { promptForQuestionText } from "./prompts/question-text.js";
import { promptForQuestionRequired } from "./prompts/question-required.js";
import { promptForGroupSelection } from "./prompts/question-group-selection.js";
import { createCallbackData } from "callback-data";

export const EDIT_QUESTION_CONVERSATION = "edit-question";

export function createEditQuestionConversation(repositories: RepositoryType) {
  return createConversation<Context>(async (conversation, ctx) => {
    const { callbackQuery } = ctx;
    if (!callbackQuery?.data) {
      throw new Error("Callback query data not found");
    }
    const { questionId } = editPanelPanelData.unpack(callbackQuery.data);
    const question = await repositories.questions.getQuestion(questionId);

    if (!question) {
      await ctx.editMessageText("Вопрос не найден");
      return;
    }

    const newQuestion: {
      id: number;
      name: string;
      text: string;
      require: boolean;
      groupIds: string[]
    } = {
      ...question,
      groupIds: question.group.map((g) => g.id),
    };

    ctx.repositories = repositories;

    newQuestion.id = questionId;

    const editQuestionCallbackData = createCallbackData('edit_question', {
      value: String,
    })

    enum EditQuestionActions {
      name = 'name',
      text = 'text',
      require = 'require',
      group = 'group',
    }

    // Отправляем сообщение с кнопками для изменения свойств вопроса
    await ctx.editMessageText("Что вы хотите изменить?", {
      reply_markup: InlineKeyboard.from([
        [{ text: "Изменить название", callback_data: editQuestionCallbackData.pack({ value: EditQuestionActions.name }) }],
        [{ text: "Изменить текст", callback_data: editQuestionCallbackData.pack({ value: EditQuestionActions.text }) }],
        [{ text: 'Добавить кнопку "Отсутсвует', callback_data: editQuestionCallbackData.pack({ value: EditQuestionActions.require }) }],
        [{ text: "Изменить получателя", callback_data: editQuestionCallbackData.pack({ value: EditQuestionActions.group }) }],
      ]),
    });

    // Ожидание нажатия одной из кнопок
    const selectionCallbackContext = await conversation.waitForCallbackQuery(editQuestionCallbackData.filter());

    selectionCallbackContext.repositories = repositories

    const action = editQuestionCallbackData.unpack(selectionCallbackContext.callbackQuery.data).value as EditQuestionActions

    switch (action) {
      case EditQuestionActions.name:
        const newName = await promptForQuestionName(conversation, selectionCallbackContext);
        newQuestion.name = newName;
        break;

      case EditQuestionActions.text:
        const newText = await promptForQuestionText(conversation, selectionCallbackContext);
        newQuestion.text = newText;
        break;

      case EditQuestionActions.require:
        const [requireReply, requiredPropertyCtx] = await promptForQuestionRequired(conversation, selectionCallbackContext);

        await requiredPropertyCtx.deleteMessage()

        newQuestion.require = requireReply;
        break;

      case EditQuestionActions.group:
        const [groupIds, selectedGroupsCtx] = await promptForGroupSelection(conversation, selectionCallbackContext, question);

        await selectedGroupsCtx.deleteMessage()

        newQuestion.groupIds = groupIds;
        break;

      default:
        await selectionCallbackContext.reply("Неизвестное действие!");
        return;
    }

    // Сохранение изменений в базе данных
    await repositories.questions.updateQuestion(newQuestion);

    await ctx.reply("Вопрос успешно обновлен.");
  }, EDIT_QUESTION_CONVERSATION);
}
