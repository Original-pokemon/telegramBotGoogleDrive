import { HearsContext } from "grammy";
import { Context } from "#root/bot/context.js";
import {
  checkAnswerTime,
  handleFile,
  handleRestartCheck,
  sendNextMessage,
} from "../index.js";

export async function handlePhotoMessage(ctx: HearsContext<Context>) {
  const { session, logger, message } = ctx;
  const { answers, questions, customData } = session.external;

  try {
    if (!answers) {
      throw new Error("Answers not found");
    }

    if (!questions) {
      throw new Error("Questions not found");
    }

    if (answers.length === questions.length) return;

    if (checkAnswerTime(ctx)) {
      logger.info(
        `User ${session.memory.user.name} did not complete the check within 5 minutes, restarting check.`,
      );
      await handleRestartCheck(
        ctx,
        "Вы не уложились в 5 минут.\nПройдите проверку заново",
      );
      return;
    }

    const fileName = questions[answers.length].name;
    const messageDate = message?.date;
    if (!messageDate) {
      throw new Error("Message date not found");
    }

    customData.lastMessageDate = messageDate;

    // Get file with retry on HttpError
    const file = await handleFile(ctx);

    const urlFile = file.getUrl();

    answers.push({
      fileName,
      urlFile,
      id: file.file_id,
    });

    logger.info(
      `User ${session.memory.user.name} answered question ${fileName} with file ${file.file_id}`,
    );

    // Send next question or end message
    await sendNextMessage(ctx, answers.length, questions.length);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error in handlePhotoMessage: ${error.message}`);
    } else {
      logger.error("Unknown error occurred in handlePhotoMessage");
    }
  }
}
