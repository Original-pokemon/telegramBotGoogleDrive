import { Context } from "#root/bot/context.js";
import { sendEndMessage, sendQuestionMessage } from "./index.js";

export async function userPanel(ctx: Context) {
  const { group_id } = ctx.session.memory.user;
  const { session, logger, repositories } = ctx;

  session.external.answers = [];
  session.external.customData.lastMessageDate = undefined;

  try {
    session.external.questions =
      await repositories.questions.getQuestions(group_id);

    if (session.external.questions.length <= 0) {
      logger.warn("No questions found in the database for the given group.");
      await sendEndMessage(ctx);
      return;
    }

    session.external.scene = "sending_photo";
    logger.debug('Session scene set to "sending_photo"');

    await ctx.deleteMessage();
    await sendQuestionMessage(ctx, 0);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error in userPanel: ${error.message}`);
      await ctx.reply(
        "An error occurred while processing your request. Please try again later.",
      );
    } else {
      logger.error("Unknown error occurred in userPanel.");
    }
  }
}
