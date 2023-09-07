import { Group } from '../const.mjs';

export default function authMiddleware(bot, userRepository) {
  return async (context, next) => {
    const {
      first_name: firstName,
      last_name: lastName,
      id: userId,
    } = context.chat;

    const firstPartUserName = [...firstName]
      .filter((item) => item !== ' ')
      .join('');
    const secondPartUserName = lastName ? `_${lastName}` : '';
    const userName = firstPartUserName + secondPartUserName;

    try {
      let user = await userRepository.getUser(userId);

      if (!user) {
        // If the user in database
        const group =
          process.env.MAIN_ADMIN_ID === userId
            ? Group.Admin
            : Group.WaitConfirm;
        user = await userRepository.addUser(userId, userName, group);
        bot.api.sendMessage(
          process.env.MAIN_ADMIN_ID,
          `new User: ${JSON.stringify(user, undefined, '\t')}`
        );
      } else if (context.update?.my_chat_member) {
        // If the user block bot
        await userRepository.deleteUser(userId);
      }

      context.session.user = user;

      if (process.env.MAIN_ADMIN_ID === userId) {
        context.session.isTopAdmin = true;
      } else if (user.Group === Group.Admin) context.session.isAdmin = true;
      else context.session.isAdmin = false;
      await next();
    } catch (error) {
      console.error('auth.mv: \n', error);
    }
  };
}
