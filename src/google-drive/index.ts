import axios from "axios";
import { google, drive_v3 } from "googleapis";
import fs from "node:fs/promises";
import { config } from "../config.js";
import logger from "../logger.js";

class GoogleRepository {
  private drive?: drive_v3.Drive;

  constructor() {
    this.drive = undefined;
  }

  async init() {
    try {
      await fs.access(config.GOOGLE_APPLICATION_CREDENTIALS);
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = `Google credentials file not found. The application cannot be started. Error: ${error.message}`;
        logger.fatal(errorMessage);
        throw new Error(errorMessage);
      } else {
        logger.fatal(
          "An unknown error occurred while accessing Google credentials.",
        );
        throw new Error(
          "An unknown error occurred while accessing Google credentials.",
        );
      }
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: config.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    await auth.getClient();
    this.drive = google.drive({ version: "v3", auth });

    await this.checkMainFolderAccess();
    logger.info("Google Drive API successfully initialized.");
  }

  async checkMainFolderAccess() {
    if (!this.drive) {
      throw new Error("Google Drive API is not initialized.");
    }

    const folderId = config.MAIN_FOLDER_ID;

    try {
      const response = await this.drive.files.get({
        fileId: folderId,
        fields: "id, name",
      });

      logger.debug(
        `Main folder found: ${response.data.name} (ID: ${response.data.id})`,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        const typedError = error as { code?: number };

        if (typedError.code === 404) {
          logger.error("Main folder not found or access is denied.");
        } else {
          logger.error("Error accessing the main folder:", error.message);
        }
        throw error;
      } else {
        logger.error(
          "An unknown error occurred while accessing the main folder.",
        );
        throw new Error(
          "An unknown error occurred while accessing the main folder.",
        );
      }
    }
  }

  async makeFolder({
    folderName,
    parentIdentifiers,
  }: {
    folderName: string;
    parentIdentifiers: string;
  }) {
    if (!this.drive) {
      throw new Error("Google Drive API is not initialized.");
    }

    logger.debug(`Creating folder ${folderName}...`);

    const { data } = await this.drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentIdentifiers],
      },
      fields: "id",
    });

    if (!data.id) {
      throw new Error(`Failed to create folder ${folderName}.`);
    }

    await this.drive.permissions.create({
      fileId: data.id,
      requestBody: {
        type: "anyone",
        role: "reader",
      },
    });

    logger.debug(`Folder ${folderName} created.`);
    return data.id;
  }

  async deleteFolder(folderId: string) {
    if (!this.drive) {
      throw new Error("Google Drive API is not initialized.");
    }

    try {
      logger.debug(`Deleting folder with ID: ${folderId}...`);

      await this.drive.files.delete({
        fileId: folderId,
      });

      logger.debug(`Folder with ID ${folderId} successfully deleted.`);
    } catch (error) {
      logger.error("Error deleting folder:", error);
      throw error;
    }
  }

  async upload({
    urlPath,
    fileName,
    parentIdentifiers,
  }: {
    urlPath: string;
    fileName: string;
    parentIdentifiers: string;
  }) {
    if (!this.drive) {
      throw new Error("Google Drive API is not initialized.");
    }

    try {
      logger.debug(`Uploading file ${fileName} to Google Drive...`);

      const { headers, data: responseData } = await axios.get(urlPath, {
        responseType: "stream",
      });

      const mimeType = headers["content-type"];

      if (!mimeType) {
        throw new Error("No Content-Type header found.");
      }

      if (typeof mimeType !== "string") {
        throw new TypeError("Content-Type header is not a string.");
      }

      const media = {
        mimeType,
        body: responseData,
      };

      const fileMetadata = {
        name: fileName,
        parents: [parentIdentifiers],
      };

      const { data } = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: "id",
      });

      if (!data.id) {
        throw new Error(`Failed to upload file ${fileName}.`);
      }

      await this.drive.permissions.create({
        fileId: data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      logger.debug(`File ${fileName} uploaded to Google Drive.`);

      return data.id;
    } catch (error) {
      logger.error("Error uploading file:", error);
      throw error;
    }
  }
}

export type GoogleRepositoryType = GoogleRepository;

export default new GoogleRepository();
