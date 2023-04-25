export function responseTimeMiddleware() {
  return async (ctx, next) => {
    try {
      console.time(ctx.update.callback_query?.data || ctx.update.message?.text || 'photo') // milliseconds
      // invoke downstream middleware
      await next() // make sure to `await`!
      console.timeEnd(ctx.update.callback_query?.data || ctx.update.message?.text || 'photo')
    } catch (error) {
      console.error('Error in responseTimeMiddleware:', error)
    }
  }
}