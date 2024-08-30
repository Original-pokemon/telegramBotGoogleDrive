import { addQuestionCallback } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { InlineKeyboard } from "grammy";

export async function questionPanel(ctx: Context) {
  const QUESTION_PANEL_TEXT = 'Панель управленя вопросами';

  const showAllQuestions = 'show_all_questions';

  const markup = InlineKeyboard.from([
    [{ text: 'Создать новый вопрос', callback_data: addQuestionCallback }],
    [{ text: 'Показать все вопросы', callback_data: showAllQuestions }],
  ])

  try {
    await ctx.reply(QUESTION_PANEL_TEXT, {
      reply_markup: markup
    });

    ctx.logger.debug('Question panel displayed successfully');
  } catch (error) {
    ctx.logger.error(`Error in admin.service > questionPanel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};