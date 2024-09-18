import { Context } from "#root/bot/context.js";
import { InlineKeyboard } from "grammy";
import { addQuestionCallback } from "#root/bot/callback-data/index.js"; // Убедитесь, что импортируете правильный идентификатор

export async function questionPanel(ctx: Context) {
  const QUESTION_PANEL_TEXT = "Панель управления вопросами";
  const SHOW_ALL_QUESTIONS_CALLBACK = "show_all_questions";
  const ERROR_MESSAGE =
    "Произошла ошибка при открытии панели управления вопросами.";

  const markup = InlineKeyboard.from([
    [{ text: "Создать новый вопрос", callback_data: addQuestionCallback }],
    [
      {
        text: "Показать все вопросы",
        callback_data: SHOW_ALL_QUESTIONS_CALLBACK,
      },
    ],
  ]);

  try {
    await ctx.reply(QUESTION_PANEL_TEXT, {
      reply_markup: markup,
    });

    ctx.logger.debug("Question panel displayed successfully");
  } catch (error: unknown) {
    ctx.logger.error(
      `Error in admin.service > questionPanel: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    await ctx.reply(ERROR_MESSAGE);
  }
}
