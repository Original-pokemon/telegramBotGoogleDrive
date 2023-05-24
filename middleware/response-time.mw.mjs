export default function responseTimeMiddleware() {
  return async (context, next) => {
    const userName = context.session.user.Name;
    const callbackData = context.update.callback_query?.data;
    const messageText = context.update.message?.text;
    const messageId =
      context.update.message?.message_id ||
      context.update.callback_query?.message.message_id;
    const messageInfo = callbackData || messageText || 'mediaFile';
    const consoleText = `${userName} :>> msgid: ${messageId}, msgInfo: ${messageInfo}, time`;

    try {
      console.time(consoleText); // milliseconds
      // invoke downstream middleware
      await next(); // make sure to `await`!
      console.timeEnd(consoleText);
    } catch (error) {
      console.error('Error in responseTimeMiddleware:', error);
    }
  };
}
