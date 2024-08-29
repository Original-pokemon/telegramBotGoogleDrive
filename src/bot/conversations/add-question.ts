import { Conversation, createConversation } from "@grammyjs/conversations";
import { Context, RepositoryType } from "../context.js";
import { Question } from "@prisma/client";
import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { questionRequiredAttribute, selectGroupId } from "../callback-data/index.js";
import { UserGroup } from "#root/const.js";
import { strict } from "assert";

type ConversationProperties = {
  ctx: Context;
  conversation: Conversation<Context>;
};

export const CREATE_TICKET_CONVERSATION = "create-question";

export const createQuestionConversation = (repositories: RepositoryType) => {
  return createConversation<Context>(async (conversation, ctx) => {
    const {
      form,
    } = conversation

    ctx.repositories = repositories;

    const newQuestion: {
      name: string;
      text: string;
      require: boolean;
      groupIds: string[]
    } = Object.create(null);

    await ctx.editMessageText(
      'Введите название вопроса:\n\nНазвание должно отражать то, что будет на фото\n\nК примеру - Витрина '
    );

    newQuestion.name = await form.text()

    await ctx.reply(
      'Введите текст вопроса:\n\nК примеру - Сфотографируйте витрину(можно описать точный ракурс)'
    );

    newQuestion.text = await form.text()

    const requiredAttributelayout = [
      [{ text: 'Да', callback_data: questionRequiredAttribute.pack({ value: true }) }],
      [{ text: 'Нет', callback_data: questionRequiredAttribute.pack({ value: false }) }],
    ];

    const requiredAttributeMarkup = InlineKeyboard.from(requiredAttributelayout)

    await ctx.reply('Вопрос обязательный?', {
      reply_markup: requiredAttributeMarkup,
    });

    const requireCtx = await conversation.waitForCallbackQuery(
      questionRequiredAttribute.filter(),
    );

    const { callbackQuery } = requireCtx

    newQuestion.require = questionRequiredAttribute.unpack(callbackQuery.data).value

    const callback = 'save_group_selection'

    const groups = await repositories.groups.getAllGroups();
    const question = await repositories.questions.getQuestion(4654645);

    const selectedGroupIds: {
      [key: string]: boolean
    } = {}

    if (question) {
      question.group.forEach(({ id }) => selectedGroupIds[id] = true)
    }

    conversation.session.customData.selectedGroupIds = selectedGroupIds

    const groupsLayout: [{ text: string, callback_data: string }][] = []

    groups.forEach(({ id }) => {
      if (id !== UserGroup.Admin && id !== UserGroup.WaitConfirm) {
        const isSelected = selectedGroupIds[id];
        const buttonText = isSelected ? `${id}✅` : `${id}⛔`;

        groupsLayout.push([
          { text: buttonText, callback_data: selectGroupId.pack({ id }) },
        ])
      }
    })

    groupsLayout.push([{ text: "Сохранить", callback_data: callback }])

    const markup = InlineKeyboard.from(groupsLayout)

    await requireCtx.editMessageText(
      'Выберите типы АЗС, которые будут получать уведомление:',
      { reply_markup: markup }
    );

    await conversation.waitForCallbackQuery(callback, {
      otherwise: async (answerCtx: Context) => {
        const { customData } = conversation.session

        if (!(typeof customData.selectedGroupIds === 'object')) {
          throw new Error('selectedGroupIds must be an object')
        }

        if (!customData.selectedGroupIds) {
          throw new Error('selectedGroupIds must be defined')
        }

        const selectedGroupIds = customData.selectedGroupIds as { [key: string]: boolean }

        if (answerCtx.hasCallbackQuery(selectGroupId.filter())) {
          const { callbackQuery } = answerCtx
          const { id } = selectGroupId.unpack(callbackQuery.data)

          if (selectedGroupIds[id]) {
            delete selectedGroupIds[id]
          } else {
            selectedGroupIds[id] = true
          }

          const groupsLayout: [{ text: string, callback_data: string }][] = []

          groups.forEach(({ id }) => {
            if (id !== UserGroup.Admin && id !== UserGroup.WaitConfirm) {
              const isSelected = selectedGroupIds[id];
              const buttonText = isSelected ? `${id}✅` : `${id}⛔`;

              groupsLayout.push([
                { text: buttonText, callback_data: selectGroupId.pack({ id }) },
              ])
            }
          })

          groupsLayout.push([{ text: "Сохранить", callback_data: callback }])

          const markup = InlineKeyboard.from(groupsLayout)

          await answerCtx.editMessageText(
            'Выберите типы АЗС, которые будут получать уведомление:',
            { reply_markup: markup }
          );
        }
      }
    })

    if (!conversation.session.customData.selectedGroupIds) {
      throw new Error('selectedGroupIds must be defined')
    }

    newQuestion.groupIds = Object.keys(conversation.session.customData.selectedGroupIds)

    await repositories.questions.addQuestion(newQuestion)

    await ctx.reply('Вопрос добавлен')
  }, CREATE_TICKET_CONVERSATION)
}