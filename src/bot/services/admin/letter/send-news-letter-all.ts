import { Context } from "#root/bot/context.js";

export async function sendNewsletterForAll(ctx: Context) {
  ctx.logger.trace("Newsletter sending process started");

  ctx.session.external.scene = "";
  ctx.logger.debug("Session scene cleared");

  if (!ctx.msg?.text) {
    throw new Error("No message text provided");
  }

  const messageText = ctx.msg.text;
  ctx.logger.debug(`Message text to be sent: ${messageText}`);

  try {
    const users = await ctx.repositories.users.getAllAzs();
    ctx.logger.debug(`Retrieved ${users.length} users to send the newsletter`);

    const promises = users.map(async ({ id }) => {
      try {
        await ctx.api.sendMessage(id, messageText);
        ctx.logger.info(`Message sent successfully to user with id: ${id}`);
      } catch (error) {
        ctx.logger.error(
          `Failed to send message to user with id ${id}: ${error instanceof Error ? error.message : error}`,
        );
      }
    });

    await Promise.allSettled(promises);

    await ctx.reply("Сообщение отправленно всем пользователям");
    ctx.logger.debug("Newsletter sent to all users successfully");
  } catch (error) {
    ctx.logger.error(
      `Error in admin.service > sendNewsletterForAll: ${error instanceof Error ? error.message : error}`,
    );
  }
}
