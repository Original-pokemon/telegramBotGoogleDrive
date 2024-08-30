import { Context } from "#root/bot/context.js";
import { Conversation } from "@grammyjs/conversations";

export async function promptForQuestionName(conversation: Conversation<Context>, ctx: Context): Promise<string> {
  await ctx.editMessageText(
    'Введите название вопроса:\n\nНазвание должно отражать то, что будет на фото\n\nК примеру - Витрина '
  );

  return await conversation.form.text();
}