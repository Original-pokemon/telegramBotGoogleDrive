import { selectGroupId } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { UserGroup } from "#root/const.js";
import { Conversation } from "@grammyjs/conversations";
import { Question } from "@prisma/client";
import { InlineKeyboard } from "grammy";

async function updateGroupSelectionKeyboard(ctx: Context, groups: any[], selectedGroupIds: { [key: string]: boolean }) {
  const callback = 'save_group_selection';

  let selectedGroupsCounter = 0;

  const groupsLayout: [{ text: string, callback_data: string }][] = groups.map(({ id }) => {
    if (id !== UserGroup.Admin && id !== UserGroup.WaitConfirm) {
      const isSelected = selectedGroupIds[id];
      selectedGroupsCounter += isSelected ? 1 : 0;
      const buttonText = isSelected ? `${id}✅` : `${id}⛔`;

      return [
        { text: buttonText, callback_data: selectGroupId.pack({ id }) },
      ];
    }
  }).filter(Boolean) as [{ text: string, callback_data: string }][]; // фильтруем undefined

  if (selectedGroupsCounter > 0) {
    groupsLayout.push([{ text: "Сохранить", callback_data: callback }]);
  }

  const markup = InlineKeyboard.from(groupsLayout);

  await ctx.editMessageText(
    'Выберите типы АЗС, которые будут получать уведомление:',
    { reply_markup: markup }
  );
}

export async function promptForGroupSelection(conversation: Conversation<Context>, ctx: Context, question: {
  group: {
    id: string;
  }[];
} & Question | undefined = undefined): Promise<[string[], Context]> {
  const { customData } = conversation.session;
  const groups = await ctx.repositories.groups.getAllGroups();
  const selectedGroupIds: { [key: string]: boolean } = {}; //сбрасывает выбранные группы

  if (question) {
    question.group.forEach(({ id }) => selectedGroupIds[id] = true)
  }

  if (!(typeof customData.selectedGroupIds === 'object')) {
    customData.selectedGroupIds = selectedGroupIds;
  }


  const callback = 'save_group_selection';

  await updateGroupSelectionKeyboard(ctx, groups, customData.selectedGroupIds as { [key: string]: boolean });

  await conversation.waitForCallbackQuery(callback, {
    otherwise: async (answerCtx: Context) => {
      const { customData } = conversation.session;

      if (!(typeof customData.selectedGroupIds === 'object')) {
        throw new Error('selectedGroupIds must be an object');
      }

      if (!customData.selectedGroupIds) {
        throw new Error('selectedGroupIds must be defined');
      }

      const selectedGroupIds = customData.selectedGroupIds as { [key: string]: boolean };

      if (answerCtx.hasCallbackQuery(selectGroupId.filter())) {
        const { id } = selectGroupId.unpack(answerCtx.callbackQuery.data);

        if (selectedGroupIds[id]) {
          delete selectedGroupIds[id];
        } else {
          selectedGroupIds[id] = true;
        }

        await updateGroupSelectionKeyboard(answerCtx, groups, selectedGroupIds);
      }
    }
  });

  if (!conversation.session.customData.selectedGroupIds) {
    throw new Error('selectedGroupIds must be defined')
  }

  const result = Object.keys(conversation.session.customData.selectedGroupIds)

  delete conversation.session.customData.selectedGroupIds

  return [result, ctx]
}