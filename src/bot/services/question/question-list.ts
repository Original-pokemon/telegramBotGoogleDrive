import { questionProfileData } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { InlineKeyboard } from "grammy";

export async function showQuestionList(ctx: Context) {
  const { repositories, logger } = ctx
  const QUESTION_LIST_TEXT = 'Все вопросы';

  try {
    const questions = await repositories.questions.getAllQuestions();
    const markupLayout = questions.map((question) => {
      return [{ text: question.name, callback_data: questionProfileData.pack({ questionId: question.id }) }];
    });

    const markup = InlineKeyboard.from(markupLayout);
    await ctx.editMessageText(QUESTION_LIST_TEXT, { reply_markup: markup });
    logger.debug('Question list displayed successfully');
  } catch (error: unknown) {
    logger.error(`Error in showQuestionList: ${error instanceof Error ? error.message : 'Unknown error'}`);
    await ctx.reply('Произошла ошибка при получении списка вопросов.');
  }
};