
export function authMiddleware(bot, userRepository) {
  return async (ctx, next) => {
    const userId = ctx.chat.id
    const first_name = ctx.chat.first_name
    const last_name = ctx.chat.last_name ? `_${ctx.chat.last_name}` : ''
    const userName =
      first_name
        .split('')
        .filter((item) => item !== ' ')
        .join('') + last_name
    try {
      let user = await userRepository.getUser(userId)


      if (!user) {
        const group = process.env.MAIN_ADMIN_ID == userId ? 'admin' : 'waitConfirm'
        user = await userRepository.addUser(userId, userName, group)
        bot.api.sendMessage(
          process.env.MAIN_ADMIN_ID,
          `new User: ${JSON.stringify(user, null, '\t')}`
        )
      } else if (ctx.update?.my_chat_member) {
        await userRepository.deleteUser(userId)
      }


      ctx.session.user = user

      if (process.env.MAIN_ADMIN_ID == userId) {
        ctx.session.isTopAdmin = true
      } else if (user.Group == 'admin') ctx.session.isAdmin = true
      else ctx.session.isAdmin = false
      await next()
    } catch (err) {
      console.error('auth.mv: \n', err)
    }
  }
}
