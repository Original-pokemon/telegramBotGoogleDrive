import { Context } from "#root/bot/context.js";
import { CREATE_TICKET_CONVERSATION } from "#root/bot/conversations/index.js";

export async function addQuestion(ctx: Context) {
  try {
    ctx.logger.debug('Starting addQuestion conversation.');
    await ctx.conversation.enter(CREATE_TICKET_CONVERSATION);
    ctx.logger.debug('addQuestion conversation entered successfully.');
  } catch (error) {
    if (error instanceof Error) {
      ctx.logger.error(`Error entering addQuestion conversation: ${error.message}`);
      throw error;
    } else {
      ctx.logger.error('Unknown error occurred while entering addQuestion conversation.');
      throw new Error('An unknown error occurred');
    }
  }
}