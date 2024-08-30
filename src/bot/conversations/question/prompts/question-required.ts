import { questionRequiredAttribute } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { Conversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";

export async function promptForQuestionRequired(conversation: Conversation<Context>, ctx: Context): Promise<[boolean, Context]> {
  const requiredAttributelayout = [
    [{ text: 'Да', callback_data: questionRequiredAttribute.pack({ value: true }) }],
    [{ text: 'Нет', callback_data: questionRequiredAttribute.pack({ value: false }) }],
  ];

  const requiredAttributeMarkup = InlineKeyboard.from(requiredAttributelayout);

  await ctx.reply('Вопрос обязательный?', {
    reply_markup: requiredAttributeMarkup,
  });

  const requireCtx = await conversation.waitForCallbackQuery(
    questionRequiredAttribute.filter(),
  );

  return [questionRequiredAttribute.unpack(requireCtx.callbackQuery.data).value, requireCtx];
}