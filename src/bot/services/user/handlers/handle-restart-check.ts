import { Context } from "#root/bot/context.js";
import { sendQuestionMessage } from "../index.js";

export async function handleRestartCheck(ctx: Context, message = '') {
  const { group_id, name } = ctx.session.memory.user;
  const { logger, repositories, session } = ctx;

  try {
    // Reset session data
    session.external.questions = await repositories.questions.getQuestions(group_id);
    session.external.answers = [];
    session.external.customData.lastMessageDate = undefined;

    // Notify user if message is provided
    if (message) {
      await ctx.reply(message);
    }

    // Send the first question message
    await sendQuestionMessage(ctx, 0);

    logger.info(`${name} :>> Restart check`);
  } catch (error) {
    // Log the error and handle the retry mechanism
    logger.error(`Error in handleRestartCheck: ${error instanceof Error ? error.message : 'Unknown error'}`);
    // Optionally, you could add a retry mechanism here
  }
}
