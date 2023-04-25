export function responseTimeMiddleware() {
  return async (ctx, next) => {
    try {
      const text = `${ctx.session.user.Name} :>> ${ctx.update.callback_query?.data || ctx.update.message?.text || 'photo'}`
      console.time(text) // milliseconds
      // invoke downstream middleware
      await next() // make sure to `await`!
      console.timeEnd(text)
    } catch (error) {
      console.error('Error in responseTimeMiddleware:', error)
    }
  }
}