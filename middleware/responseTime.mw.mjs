export function responseTimeMiddleware() {
  return async (ctx, next) => {
    try {
      const now = new Date()
      const before = Date.now() // milliseconds
      // invoke downstream middleware
      await next() // make sure to `await`!
      // take time after
      const after = Date.now() // milliseconds
      // log difference
      console.log(
        `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()} `,
        `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`,
        `Response time: ${after - before} ms`,
        ctx.update.callback_query?.data || ctx.update.message?.text || 'photo'
      )
    } catch (error) {
      console.error('Error in responseTimeMiddleware:', error)
    }
  }
}