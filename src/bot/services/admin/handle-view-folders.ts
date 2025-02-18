import { Context } from "#root/bot/context.js";
import { HearsContext } from "grammy";

export const handleViewFolders = async (ctx: HearsContext<Context>) => {
  const {
    repositories: { photoFolders, googleDrive },
    logger,
  } = ctx;
  const currentDate = new Date();
  const oneMonthAgo = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    currentDate.getDate(),
  );
  const twoMonthAgo = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 6,
    currentDate.getDate(),
  );

  try {
    const folders = await photoFolders.getFoldersBetweenDates(
      twoMonthAgo,
      oneMonthAgo,
    );

    const deletePromises = folders.map(async ({ folder_id }) => {
      await googleDrive.deleteFolder(folder_id);
      await photoFolders.deleteFolder(folder_id);
    });

    await Promise.all(deletePromises);

    await ctx.reply(`Found ${folders.length} folders older than two month.`);
    await ctx.reply(JSON.stringify(folders.at(-1)));
  } catch (error) {
    logger.error("throw error when found folders", error);
    ctx.reply("Failed to retrieve folders.");
  }
};
