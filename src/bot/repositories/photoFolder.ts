import { PhotoFolder } from "@prisma/client";
import Repository from "./repository.js";
import logger from "#root/logger.js";

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

  async deleteFolder(folderId: string): Promise<void> {
    logger.trace(`Attempting to delete folder with id: ${folderId}`);
    try {
      await this.client.photoFolder.delete({
        where: { folder_id: folderId },
      });
      logger.debug(`Successfully deleted folder with id: ${folderId}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error deleting folder with id ${folderId}: ${error.message}`);
        throw new Error(`Error deleting folder with id ${folderId}: \n${error.message}`);
      }
      throw error;
    }
  }

  async addFolder({ folder_id, user_id }: Omit<PhotoFolder, 'creation_date'>): Promise<PhotoFolder> {
    logger.trace(`Attempting to add folder with id: ${folder_id} for user id: ${user_id}`);
    try {
      const newFolder = await this.client.photoFolder.create({
        data: {
          folder_id,
          user_id,
        },
      });
      logger.debug(`Successfully added folder with id: ${folder_id}`);
      return newFolder;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error adding folder with id ${folder_id}: ${error.message}`);
        throw new Error(`Error adding folder with id ${folder_id}: \n${error.message}`);
      }
      throw error;
    }
  }
}
