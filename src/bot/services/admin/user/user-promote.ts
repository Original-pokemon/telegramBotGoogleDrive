import { promoteUserData } from "#root/bot/callback-data/index.js";
import { Context } from "#root/bot/context.js";
import { UserGroup } from "#root/const.js";
import { CallbackQueryContext } from "grammy";

export async function promoteUser(ctx: CallbackQueryContext<Context>) {
  const { callbackQuery, repositories, session, logger } = ctx;

  try {
    const { userId } = promoteUserData.unpack(callbackQuery.data);
    logger.debug(`Attempting to promote or demote user with ID: ${userId}`);

    const user = await repositories.users.getUser(userId);
    if (!user) {
      logger.warn(`User with ID ${userId} not found`);
      return await ctx.editMessageText("Пользователь не найден!");
    }

    if (!session.memory.isAdmin) {
      logger.warn(
        `Unauthorized promotion attempt by non-admin user with session ID: ${session.memory.user.id}`,
      );
      return await ctx.editMessageText("Вы не администратор!");
    }

    if (user.group_id === UserGroup.Admin) {
      if (userId === session.memory.user.id) {
        logger.warn("Attempt to restrict access to oneself.");
        return await ctx.editMessageText(
          "Вы не можете ограничить доступ самому себе!",
        );
      }

      await repositories.users.updateUser({
        id: userId,
        name: user.name,
        group_id: UserGroup.WaitConfirm,
        user_folder: user.user_folder,
      });

      logger.info(`User with ID ${userId} demoted from Admin to WaitConfirm`);

      return await ctx.editMessageText("Пользователь успешно понижен!");
    }
    await repositories.users.updateUser({
      id: userId,
      name: user.name,
      group_id: UserGroup.Admin,
      user_folder: user.user_folder,
    });

    logger.info(`User with ID ${userId} promoted to Admin`);

    return await ctx.editMessageText("Пользователь успешно повышен!");
  } catch (error) {
    logger.error(
      `Error in admin.service > userPromote: ${error instanceof Error ? error.message : error}`,
    );
    return false;
  }
}
