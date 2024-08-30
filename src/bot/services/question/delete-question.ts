import { deleteQuestionData } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { CallbackQueryContext } from "grammy";

export async function deleteQuestion(ctx: CallbackQueryContext<Context>) {
  const SUCCESS_DELETE_MESSAGE = 'Вопрос успешно удален из базы данных!';
  const ERROR_DELETE_MESSAGE = 'Произошла ошибка при удалении вопроса.';
  const { repositories, callbackQuery, logger } = ctx;

  try {
    const { questionId } = deleteQuestionData.unpack(callbackQuery.data);

    await repositories.questions.deleteQuestion(questionId);
    await ctx.editMessageText(SUCCESS_DELETE_MESSAGE);

    logger.debug(`Question with ID: ${questionId} successfully deleted`);

    delete ctx.session.customData.question;
  } catch (error) {
    console.error('Ошибка в функции deleteQuestion:', error);
    await ctx.reply(ERROR_DELETE_MESSAGE);
  }
};