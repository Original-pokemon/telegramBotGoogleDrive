import { RepositoryType } from "#root/bot/context.js";
import logger from "#root/logger.js";

export const deleteOldFolders = async (repositories: RepositoryType) => {
  const { photoFolders, googleDrive } = repositories;
  const currentDate = new Date();
  const oneMonthAgo = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    currentDate.getDate(),
  );
  const sixMonthAgo = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 6,
    currentDate.getDate(),
  );

  try {
    const folders = await photoFolders.getFoldersBetweenDates(
      sixMonthAgo,
      oneMonthAgo,
    );

    const deletePromises = folders.map(async ({ folder_id }) => {
      await googleDrive.deleteFolder(folder_id);
      await photoFolders.deleteFolder(folder_id);
    });

    await Promise.all(deletePromises);

    logger.info(`delete ${folders.length} old folders`);
  } catch (error) {
    logger.error({ err: error }, "throw error when found folders");
  }
};
