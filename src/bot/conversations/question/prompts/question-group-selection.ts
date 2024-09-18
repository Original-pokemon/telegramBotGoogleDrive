/* eslint-disable no-restricted-syntax */
import { selectGroupId } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { UserGroup } from "#root/const.js";
import { Conversation } from "@grammyjs/conversations";
import { Group, Question } from "@prisma/client";
import { InlineKeyboard } from "grammy";

async function updateGroupSelectionKeyboard(
  ctx: Context,
  groups: Group[],
  selectedGroupIds: { [key: string]: boolean },
) {
  const callback = "save_group_selection";

  let selectedGroupsCounter = 0;

  const groupsLayout: [{ text: string; callback_data: string }][] = [];

  for (const { id } of groups) {
    if (id !== UserGroup.Admin && id !== UserGroup.WaitConfirm) {
      const isSelected = selectedGroupIds[id];
      selectedGroupsCounter += isSelected ? 1 : 0;
      const buttonText = isSelected ? `${id}✅` : `${id}⛔`;

      groupsLayout.push([
        { text: buttonText, callback_data: selectGroupId.pack({ id }) },
      ]);
    }
  }

  if (selectedGroupsCounter > 0) {
    groupsLayout.push([{ text: "Сохранить", callback_data: callback }]);
  }

  const markup = InlineKeyboard.from(groupsLayout);

  await ctx.editMessageText(
    "Выберите типы АЗС, которые будут получать уведомление:",
    { reply_markup: markup },
  );
}

export async function promptForGroupSelection(
  conversation: Conversation<Context>,
  ctx: Context,
  question?: { group: Group[] } & Question,
): Promise<[string[], Context]> {
  const { customData } = conversation.session.external;
  const groups = await ctx.repositories.groups.getAllGroups();

  customData.selectedGroupIds = question
    ? Object.fromEntries(question.group.map((g) => [[g.id], true]))
    : {};

  const callback = "save_group_selection";

  await updateGroupSelectionKeyboard(
    ctx,
    groups,
    customData.selectedGroupIds as { [key: string]: boolean },
  );

  await conversation.waitForCallbackQuery(callback, {
    otherwise: async (answerCtx: Context) => {
      const { customData: answerCustomData } = conversation.session.external;

      if (!answerCustomData.selectedGroupIds) {
        throw new Error("selectedGroupIds must be defined");
      }

      if (!(typeof answerCustomData.selectedGroupIds === "object")) {
        throw new TypeError("selectedGroupIds must be an object");
      }

      const { selectedGroupIds } = answerCustomData as {
        selectedGroupIds: { [key: string]: boolean };
      };

      if (answerCtx.hasCallbackQuery(selectGroupId.filter())) {
        const { id } = selectGroupId.unpack(answerCtx.callbackQuery.data);

        if (selectedGroupIds[id]) {
          delete selectedGroupIds[id];
        } else {
          selectedGroupIds[id] = true;
        }

        await updateGroupSelectionKeyboard(answerCtx, groups, selectedGroupIds);
      }
    },
    drop: true,
  });

  if (!conversation.session.external.customData.selectedGroupIds) {
    throw new Error("selectedGroupIds must be defined");
  }

  const result = Object.keys(
    conversation.session.external.customData.selectedGroupIds,
  );

  delete customData.selectedGroupIds;

  return [result, ctx];
}
