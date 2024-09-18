import type { Middleware } from "grammy";
import { UserGroup } from "../../const.js";
import { Context } from "../context.js";

export default function authMiddleware(): Middleware<Context> {
  return async (ctx, next) => {
    const {
      from,
      config,
      repositories: { users },
      logger,
      api,
      session,
      update,
    } = ctx;
    const { first_name: firstName, last_name: lastName, id } = from || {};

    if (!id || !firstName) {
      logger.warn("Authorization failed: Missing id or first name.");
      return;
    }

    const userId = id.toString();

    const firstPartUserName = [...firstName]
      .filter((item) => item !== " ")
      .join("");
    const secondPartUserName = lastName ? `_${lastName}` : "";
    const userName = firstPartUserName + secondPartUserName;

    try {
      let user = await users.getUser(userId);

      if (!user) {
        // If the user in database
        const group =
          config.MAIN_ADMIN_ID === userId
            ? UserGroup.Admin
            : UserGroup.WaitConfirm;

        user = await users.addUser({
          group_id: group,
          id: userId.toString(),
          name: userName,
          // eslint-disable-next-line unicorn/no-null
          user_folder: null,
        });

        api.sendMessage(
          config.MAIN_ADMIN_ID,
          `new User: ${JSON.stringify(user, undefined, "\t")}`,
        );
      } else if (update?.my_chat_member) {
        // If the user block bot
        await users.deleteUser(userId);
      }

      session.memory.user = user;

      session.memory.isAdmin = user.group_id === UserGroup.Admin;

      await next();
    } catch (error) {
      logger.error("auth.mv: \n", error);
    }
  };
}
