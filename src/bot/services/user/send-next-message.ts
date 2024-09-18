import { Context } from "#root/bot/context.js";
import { sendEndMessage, sendQuestionMessage } from "./index.js";

async function sendNextMessage(
  ctx: Context,
  answersLength: number,
  questionsLength: number,
) {
  const { logger } = ctx;

  try {
    if (answersLength > questionsLength) {
      logger.warn(
        `Answers length (${answersLength}) exceeds questions length (${questionsLength}).`,
      );
      return;
    }

    if (questionsLength === answersLength) {
      logger.debug("All questions have been answered, sending end message.");
      await sendEndMessage(ctx);
    } else {
      logger.debug(
        `Sending next question. Answers so far: ${answersLength}/${questionsLength}.`,
      );
      await sendQuestionMessage(ctx, answersLength);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error in sendNextMessage: ${error.message}`);
    } else {
      logger.error("Unknown error occurred in sendNextMessage.");
    }
  }
}

export { sendNextMessage };
