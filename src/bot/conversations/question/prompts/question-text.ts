import { Context } from "#root/bot/context.js";
import { Conversation } from "@grammyjs/conversations";

export async function promptForQuestionText(
  conversation: Conversation<Context>,
  ctx: Context,
): Promise<string> {
  await ctx.reply(
    "Введите текст вопроса:\n\nК примеру - Сфотографируйте витрину(можно описать точный ракурс)",
  );

  const text = await conversation.form.text();

  return text;
}
