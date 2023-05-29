export default function authMiddleware(bot, userRepository) {
  return async (context, next) => {
    const {
      first_name: firstName,
      last_name: lastName,
      id: userId,
    } = context.chat;
    const userName =
      [...firstName].filter((item) => item !== ' ').join('') + lastName
        ? `_${lastName}`
        : '';
    try {
      let user = await userRepository.getUser(userId);

      if (!user) {
        const group =
          process.env.MAIN_ADMIN_ID === userId ? 'admin' : 'waitConfirm';
        user = await userRepository.addUser(userId, userName, group);
        bot.api.sendMessage(
          process.env.MAIN_ADMIN_ID,
          `new User: ${JSON.stringify(user, undefined, '\t')}`
        );
      } else if (context.update?.my_chat_member) {
        await userRepository.deleteUser(userId);
      }

      context.session.user = user;

      if (process.env.MAIN_ADMIN_ID === userId) {
        context.session.isTopAdmin = true;
      } else if (user.Group === 'admin') context.session.isAdmin = true;
      else context.session.isAdmin = false;
      await next();
    } catch (error) {
      console.error('auth.mv: \n', error);
    }
  };
}
