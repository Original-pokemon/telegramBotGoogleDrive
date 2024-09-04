import { Context } from "#root/bot/context.js";
import { sendNextMessage } from "../index.js";

export async function handleCallbackQuery(ctx: Context) {
  const { session, logger } = ctx;
  const { answers, questions } = session.external;

  try {
    if (!answers) {
      throw new Error('Answers not found');
    }

    if (!questions) {
      throw new Error('Questions not found');
    }

    await ctx.deleteMessage();
    answers.push(undefined);

    // Log the current state before proceeding
    logger.debug(`Callback query processed: ${answers.length} of ${questions.length} answered.`);

    // Send next question or end message
    await sendNextMessage(ctx, answers.length, questions.length);

  } catch (error) {
    logger.error(`Error in handleCallbackQuery: ${error instanceof Error ? error.message : 'Unknown error'}`);
    // Optionally, you can add error handling logic here
  }
}
