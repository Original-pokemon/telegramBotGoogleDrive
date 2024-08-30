import { deleteQuestionData, editPanelPanelData, questionProfileData } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { generateQuestionProfileText } from "#root/bot/helpers/index.js";
import { CallbackQueryContext, InlineKeyboard } from "grammy";

export async function questionProfile(ctx: CallbackQueryContext<Context>) {
  const { repositories, callbackQuery } = ctx

  const { questionId } = questionProfileData.unpack(callbackQuery.data)
  const question = await repositories.questions.getQuestion(questionId);

  if (!question) {
    await ctx.editMessageText('Вопрос не найден');
    return;
  }

  await ctx.editMessageText(generateQuestionProfileText(question),
    {
      reply_markup: InlineKeyboard.from([
        [{ text: 'Изменить', callback_data: editPanelPanelData.pack({ questionId }) }],
        [{ text: 'Удалить', callback_data: deleteQuestionData.pack({ questionId }) }],
      ])
    }
  );

  ctx.session.customData.question = question;
};