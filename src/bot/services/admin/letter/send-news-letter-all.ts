import { confirmSendNewsletterData } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { InlineKeyboard } from "grammy";

export async function sendNewsletterForAll(ctx: Context) {
  ctx.logger.trace("Newsletter sending process started");

  if (!ctx.msg?.text) {
    throw new Error("No message text provided");
  }

  const messageText = ctx.msg.text;
  ctx.logger.debug(`Message text to be sent: ${messageText}`);

  // Save text in session for confirmation
  ctx.session.external.newsletterText = messageText;
  ctx.session.external.scene = "";
  ctx.logger.debug("Session scene cleared and text saved");

  try {
    const keyboard = new InlineKeyboard()
      .text(
        "✅ Подтвердить отправку",
        confirmSendNewsletterData.pack({ action: "confirm" }),
      )
      .row()
      .text("❌ Отмена", confirmSendNewsletterData.pack({ action: "cancel" }));

    await ctx.reply(
      `Подтвердите отправку рассылки:\n\n"${messageText}"\n\nЭто сообщение будет отправлено всем пользователям.`,
      {
        reply_markup: keyboard,
      },
    );
    ctx.logger.debug("Newsletter confirmation sent");
  } catch (error) {
    ctx.logger.error(
      `Error in admin.service > sendNewsletterForAll: ${error instanceof Error ? error.message : error}`,
    );
  }
}

export async function confirmSendNewsletter(ctx: Context, action: string) {
  ctx.logger.trace(`Newsletter confirmation action: ${action}`);

  const messageText = ctx.session.external.newsletterText;
  if (!messageText) {
    await ctx.editMessageText("Текст сообщения не найден. Попробуйте снова.");
    return;
  }

  if (action === "cancel") {
    delete ctx.session.external.newsletterText;
    await ctx.editMessageText("Отправка рассылки отменена.");
    ctx.logger.debug("Newsletter sending cancelled");
    return;
  }

  if (action === "confirm") {
    try {
      const users = await ctx.repositories.users.getAllAzs();
      ctx.logger.debug(
        `Retrieved ${users.length} users to send the newsletter`,
      );

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

      delete ctx.session.external.newsletterText;
      await ctx.editMessageText("Сообщение отправлено всем пользователям.");
      ctx.logger.debug("Newsletter sent to all users successfully");
    } catch (error) {
      ctx.logger.error(
        `Error in admin.service > confirmSendNewsletter: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
