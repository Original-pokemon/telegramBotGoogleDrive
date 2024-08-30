import { Context } from "#root/bot/context.js";
import { CREATE_TICKET_CONVERSATION } from "#root/bot/conversations/index.js";

export function addQuestion(ctx: Context) {
  ctx.conversation.enter(CREATE_TICKET_CONVERSATION)
}