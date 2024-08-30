import { deleteQuestionData, editPanelPanelData, questionProfileData } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { generateQuestionProfileText } from "#root/bot/helpers/index.js";
import { CallbackQueryContext, InlineKeyboard } from "grammy";

export async function questionProfile(ctx: CallbackQueryContext<Context>) {
  const { repositories, callbackQuery, logger } = ctx

  const { questionId } = questionProfileData.unpack(callbackQuery.data);
  logger.debug(`Fetching question with ID: ${questionId}`);

  const question = await repositories.questions.getQuestion(questionId);

  if (!question) {
    logger.warn(`Question with ID ${questionId} not found.`);
    await ctx.editMessageText('Вопрос не найден');
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

  logger.info(`Displayed profile for question ID: ${questionId}`);

  ctx.session.customData.question = question;
};