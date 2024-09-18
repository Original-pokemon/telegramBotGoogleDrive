import { InlineKeyboard } from "grammy";
import { Context } from "#root/bot/context.js";

export const sendQuestionMessage = async (
  ctx: Context,
  questionNumber: number,
) => {
  const { logger, session } = ctx;
  const { questions } = session.external;
  const { user } = session.memory;

  // Проверка на наличие вопросов
  if (!questions || !questions[questionNumber]) {
    throw new Error(`Question not found for index: ${questionNumber}`);
  }

  const question = questions[questionNumber];
  const markup = new InlineKeyboard().text("Отсутствует", "skip_photo");

  try {
    await (question.require
      ? ctx.reply(question.text)
      : ctx.reply(question.text, { reply_markup: markup }));

    logger.info(`${user.name} :>> Sent question: ${question.name}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(
        `Error sending question '${question.name}' to user '${user.name}': ${error.message}`,
      );
    } else {
      logger.error(
        `Unknown error occurred while sending question '${question.name}' to user '${user.name}'`,
      );
    }
  }
};
