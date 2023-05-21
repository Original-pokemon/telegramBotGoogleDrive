export function responseTimeMiddleware() {
  return async (ctx, next) => {
    const userName = ctx.session.user.Name
    const callbackData = ctx.update.callback_query?.data
    const messageText = ctx.update.message?.text
    const messageId =
      ctx.update.message?.message_id ||
      ctx.update.callback_query?.message.message_id;
    const messageInfo = callbackData || messageText || "mediaFile"
    const consoleText = `${userName} :>> msgid: ${messageId}, msgInfo: ${messageInfo}`;
    
    try {
      console.time(consoleText) // milliseconds
      // invoke downstream middleware
      await next() // make sure to `await`!
      console.timeEnd(consoleText)
    } catch (error) {
      console.error('Error in responseTimeMiddleware:', error)
    }
  }
}