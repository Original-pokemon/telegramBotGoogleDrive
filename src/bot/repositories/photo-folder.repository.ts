import { PhotoFolder } from "@prisma/client";
import logger from "#root/logger.js";
import Repository from "./repository.js";

export default class PhotoFolderRepository extends Repository {
  async getAllFolders(): Promise<PhotoFolder[]> {
    logger.trace("Attempting to retrieve all folders");
    try {
      const folders = await this.client.photoFolder.findMany();
      logger.debug(`Successfully retrieved ${folders.length} folders`);
      return folders;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error retrieving all folders: ${error.message}`);
        throw new Error(`Error retrieving all folders: \n${error.message}`);
      }
      throw error;
    }
  }

  async getFolder(folderId: string): Promise<PhotoFolder | null> {
    logger.trace(`Attempting to retrieve folder with id: ${folderId}`);
    try {
      const folder = await this.client.photoFolder.findUnique({
        where: { folder_id: folderId },
      });
      if (folder) {
        logger.debug(`Successfully retrieved folder with id: ${folderId}`);
      } else {
        logger.debug(`Folder with id: ${folderId} not found`);
      }
      return folder;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(
          `Error retrieving folder with id ${folderId}: ${error.message}`,
        );
        throw new Error(
          `Error retrieving folder with id ${folderId}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async getUserFolderByDate(
    userId: string,
    date: Date,
  ): Promise<string | undefined> {
    logger.trace(
      `Attempting to retrieve folder for user id: ${userId} on date: ${date.toISOString()}`,
    );
    try {
      const folder = await this.client.photoFolder.findFirst({
        where: {
          user_id: userId,
          creation_date: {
            gte: new Date(date.setHours(0, 0, 0, 0)), // Start of the day
            lt: new Date(date.setHours(23, 59, 59, 999)), // End of the day
          },
        },
      });
      if (folder) {
        logger.debug(
          `Successfully retrieved folder for user id: ${userId} on date: ${date.toISOString()}`,
        );
        return folder.folder_id;
      }
      logger.debug(
        `No folder found for user id: ${userId} on date: ${date.toISOString()}`,
      );

      return undefined;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(
          `Error retrieving folder for user id ${userId} on date ${date.toISOString()}: ${error.message}`,
        );
        throw new Error(
          `Error retrieving folder for user id ${userId} on date ${date.toISOString()}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async getFoldersBetweenDates(
    startDate: Date,
    endDate: Date,
  ): Promise<PhotoFolder[]> {
    logger.trace(
      `Attempting to retrieve folders created between ${startDate.toISOString()} and ${endDate.toISOString()}`,
    );
    try {
      const folders = await this.client.photoFolder.findMany({
        where: {
          creation_date: {
            gte: startDate,
            lt: endDate,
          },
        },
      });
      logger.debug(
        `Successfully retrieved ${folders.length} folders created between ${startDate.toISOString()} and ${endDate.toISOString()}`,
      );
      return folders;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(
          `Error retrieving folders created between ${startDate.toISOString()} and ${endDate.toISOString()}: ${error.message}`,
        );
        throw new Error(
          `Error retrieving folders created between ${startDate.toISOString()} and ${endDate.toISOString()}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async deleteFolder(folderId: string): Promise<void> {
    logger.trace(`Attempting to delete folder with id: ${folderId}`);
    try {
      await this.client.photoFolder.delete({
        where: { folder_id: folderId },
      });
      logger.debug(`Successfully deleted folder with id: ${folderId}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(
          `Error deleting folder with id ${folderId}: ${error.message}`,
        );
        throw new Error(
          `Error deleting folder with id ${folderId}: \n${error.message}`,
        );
      }
      throw error;
    }
  }

  async addFolder({
    folder_id,
    user_id,
  }: Omit<PhotoFolder, "creation_date">): Promise<string> {
    logger.trace(
      `Attempting to add folder with id: ${folder_id} for user id: ${user_id}`,
    );
    try {
      const newFolder = await this.client.photoFolder.create({
        data: {
          folder_id,
          user_id,
        },
      });
      logger.debug(`Successfully added folder with id: ${folder_id}`);
      return newFolder.folder_id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(
          `Error adding folder with id ${folder_id}: ${error.message}`,
        );
        throw new Error(
          `Error adding folder with id ${folder_id}: \n${error.message}`,
        );
      }
      throw error;
    }
  }
}
