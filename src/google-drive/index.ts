import axios from "axios";
import { google, drive_v3 } from "googleapis";
import fs from "node:fs/promises";
import * as fsSync from "node:fs";
import path from "node:path";
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
          logger.error({ err: error }, "Error accessing the main folder");
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
      logger.error({ err: error }, "Error deleting folder");
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
      logger.error({ err: error }, "Error uploading file");
      throw error;
    }
  }

  async listFiles({ parentIdentifiers }: { parentIdentifiers: string }) {
    if (!this.drive) {
      throw new Error("Google Drive API is not initialized.");
    }

    const results: drive_v3.Schema$File[] = [];

    const listRecursive = async (folderId: string): Promise<void> => {
      const response = await this.drive!.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: "files(id, name, mimeType)",
      });
      const files = response.data.files || [];

      results.push(...files);
      const folderPromises = files
        .filter(
          (file) =>
            file.mimeType === "application/vnd.google-apps.folder" && file.id,
        )
        .map((file) => listRecursive(file.id!));
      await Promise.all(folderPromises);
    };

    try {
      logger.debug(
        `Recursively listing files from folder with ID: ${parentIdentifiers}...`,
      );
      await listRecursive(parentIdentifiers);
      logger.debug(
        `Files listed successfully from folder with ID: ${parentIdentifiers}.`,
      );
      return results;
    } catch (error) {
      logger.error({ err: error }, "Error recursively listing files");
      throw error;
    }
  }

  async getPermission({
    fileId,
    // permissionId,
  }: {
    fileId: string;
    // permissionId: string;
  }) {
    if (!this.drive) {
      throw new Error("Google Drive API is not initialized.");
    }

    try {
      logger.debug(
        `Getting permission with ID: for file with ID: ${fileId}...`,
      );

      const { data } = await this.drive.permissions.list({
        fileId,
        // permissionId,
        fields: "id, role, type, emailAddress",
      });

      logger.debug(
        `Permission with ID:  for file with ID: ${fileId} retrieved successfully.`,
      );
      return data;
    } catch (error) {
      logger.error({ err: error }, "Error getting permission");
      throw error;
    }
  }

  async updatePermission({
    fileId,
    permissionId,
    role,
  }: {
    fileId: string;
    permissionId: string;
    role: string;
  }) {
    if (!this.drive) {
      throw new Error("Google Drive API is not initialized.");
    }

    try {
      logger.debug(
        `Updating permission with ID: ${permissionId} for file with ID: ${fileId} to role: ${role}...`,
      );

      const { data } = await this.drive.permissions.update({
        fileId,
        permissionId,
        requestBody: {
          role,
        },
        fields: "id, role, type, emailAddress",
      });

      logger.debug(
        `Permission with ID: ${permissionId} for file with ID: ${fileId} updated successfully to role: ${role}.`,
      );
      return data;
    } catch (error) {
      logger.error({ err: error }, "Error updating permission");
      throw error;
    }
  }

  async deletePermission({
    fileId,
    permissionId,
  }: {
    fileId: string;
    permissionId: string;
  }) {
    if (!this.drive) {
      throw new Error("Google Drive API is not initialized.");
    }

    try {
      logger.debug(
        `Deleting permission with ID: ${permissionId} for file with ID: ${fileId}...`,
      );

      await this.drive.permissions.delete({
        fileId,
        permissionId,
      });

      logger.debug(
        `Permission with ID: ${permissionId} for file with ID: ${fileId} deleted successfully.`,
      );
    } catch (error) {
      logger.error({ err: error }, "Error deleting permission");
      throw error;
    }
  }

  /**
   * Скачивает все содержимое папки Google Drive на компьютер
   * @param folderId ID папки в Google Drive
   * @param localPath Локальный путь для сохранения файлов (по умолчанию './downloads')
   * @returns Объект с информацией о скачанных файлах и папках
   */
  async downloadFolder(folderId: string, localPath = "./downloads") {
    if (!this.drive) {
      throw new Error("Google Drive API is not initialized.");
    }

    try {
      logger.debug(
        `Начинаю скачивание папки с ID: ${folderId} в ${localPath}...`,
      );

      // Получаем информацию о папке
      const folderInfo = await this.drive.files.get({
        fileId: folderId,
        fields: "id, name, mimeType",
      });

      const folderName = folderInfo.data.name || "downloaded_folder";
      const downloadPath = path.join(localPath, folderName);

      // Создаем локальную папку
      await fs.mkdir(downloadPath, { recursive: true });
      logger.debug(`Создана локальная папка: ${downloadPath}`);

      // Получаем список всех файлов и папок
      const files = await this.listFiles({ parentIdentifiers: folderId });

      // Создаем карту путей для файлов и папок
      const pathMap = new Map<string, string>();
      pathMap.set(folderId, downloadPath);

      // Сначала создаем структуру папок
      const folders = files.filter(
        (file) =>
          file.mimeType === "application/vnd.google-apps.folder" && file.id,
      );

      // Создаем функцию для обработки одной папки
      const processFolder = async (file: drive_v3.Schema$File) => {
        if (!file.id) return;

        const parentId = await this.findParentId(file.id);
        if (!parentId || !pathMap.has(parentId)) return;

        const parentPath = pathMap.get(parentId)!;
        const folderPath = path.join(parentPath, file.name || "unnamed_folder");

        // Создаем локальную папку
        await fs.mkdir(folderPath, { recursive: true });
        pathMap.set(file.id, folderPath);
        logger.debug(`Создана папка: ${folderPath}`);
      };

      // Обрабатываем все папки параллельно
      await Promise.all(folders.map(processFolder));

      // Затем скачиваем файлы
      const regularFiles = files.filter(
        (file) =>
          file.mimeType !== "application/vnd.google-apps.folder" && file.id,
      );

      // Создаем функцию для скачивания одного файла
      const downloadSingleFile = async (file: drive_v3.Schema$File) => {
        if (!file.id || !file.mimeType) return { success: false, file };

        try {
          const parentId = await this.findParentId(file.id);
          if (!parentId || !pathMap.has(parentId))
            return { success: false, file };

          const parentPath = pathMap.get(parentId)!;
          const filePath = path.join(parentPath, file.name || "unnamed_file");

          // Скачиваем файл
          await this.downloadFile(file.id, file.mimeType, filePath);
          logger.debug(`Скачан файл: ${filePath}`);
          return { success: true, file };
        } catch (error) {
          logger.error(
            { err: error },
            `Ошибка при скачивании файла ${file.name}`,
          );
          return { success: false, file };
        }
      };

      // Скачиваем все файлы параллельно
      const downloadResults = await Promise.all(
        regularFiles.map(downloadSingleFile),
      );

      // Подсчитываем результаты
      const downloadedFiles = downloadResults.filter(
        (result) => result.success,
      ).length;
      const skippedFiles = downloadResults.filter(
        (result) => !result.success,
      ).length;

      logger.info(
        `Скачивание завершено. Скачано файлов: ${downloadedFiles}, пропущено: ${skippedFiles}`,
      );

      return {
        downloadPath,
        totalFiles: files.length,
        downloadedFiles,
        skippedFiles,
      };
    } catch (error) {
      logger.error({ err: error }, "Ошибка при скачивании папки");
      throw error;
    }
  }

  /**
   * Находит ID родительской папки для файла или папки
   * @param fileId ID файла или папки
   * @returns ID родительской папки или undefined
   */
  private async findParentId(fileId: string): Promise<string | undefined> {
    if (!this.drive) {
      throw new Error("Google Drive API is not initialized.");
    }

    try {
      const response = await this.drive.files.get({
        fileId,
        fields: "parents",
      });

      if (response.data.parents && response.data.parents.length > 0) {
        return response.data.parents[0];
      }

      return undefined;
    } catch (error) {
      logger.error(
        { err: error },
        `Ошибка при получении родительской папки для ${fileId}`,
      );
      return undefined;
    }
  }

  /**
   * Скачивает файл с Google Drive
   * @param fileId ID файла
   * @param mimeType MIME-тип файла
   * @param localPath Локальный путь для сохранения файла
   */
  private async downloadFile(
    fileId: string,
    mimeType: string,
    localPath: string,
  ): Promise<void> {
    if (!this.drive) {
      throw new Error("Google Drive API is not initialized.");
    }

    try {
      // Проверяем, является ли файл Google Docs, Sheets и т.д.
      if (mimeType.startsWith("application/vnd.google-apps.")) {
        // Экспортируем Google Docs в соответствующий формат
        await this.exportGoogleDoc(fileId, mimeType, localPath);
      } else {
        // Скачиваем обычный файл
        const response = await this.drive.files.get(
          {
            fileId,
            alt: "media",
          },
          { responseType: "stream" },
        );

        const destination = fsSync.createWriteStream(localPath);

        return new Promise((resolve, reject) => {
          response.data
            .on("end", () => resolve())
            .on("error", (error: Error) => reject(error))
            .pipe(destination);
        });
      }
    } catch (error) {
      logger.error({ err: error }, `Ошибка при скачивании файла ${fileId}`);
      throw error;
    }
  }

  /**
   * Экспортирует Google Docs, Sheets и другие специальные типы файлов Google
   * @param fileId ID файла
   * @param mimeType MIME-тип файла
   * @param localPath Локальный путь для сохранения файла
   */
  private async exportGoogleDoc(
    fileId: string,
    mimeType: string,
    localPath: string,
  ): Promise<void> {
    if (!this.drive) {
      throw new Error("Google Drive API is not initialized.");
    }

    // Определяем формат экспорта в зависимости от типа файла
    let exportMimeType = "application/pdf"; // По умолчанию PDF
    let extension = ".pdf";

    switch (mimeType) {
      case "application/vnd.google-apps.document": {
        exportMimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        extension = ".docx";
        break;
      }
      case "application/vnd.google-apps.spreadsheet": {
        exportMimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        extension = ".xlsx";
        break;
      }
      case "application/vnd.google-apps.presentation": {
        exportMimeType =
          "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        extension = ".pptx";
        break;
      }
      case "application/vnd.google-apps.drawing": {
        exportMimeType = "image/png";
        extension = ".png";
        break;
      }
      default: {
        // Для других типов используем PDF
        exportMimeType = "application/pdf";
        extension = ".pdf";
        break;
      }
    }

    // Если путь не заканчивается правильным расширением, добавляем его
    const finalPath = localPath.endsWith(extension)
      ? localPath
      : `${localPath}${extension}`;

    try {
      const response = await this.drive.files.export(
        {
          fileId,
          mimeType: exportMimeType,
        },
        { responseType: "stream" },
      );

      const destination = fsSync.createWriteStream(finalPath);

      return new Promise((resolve, reject) => {
        response.data
          .on("end", () => resolve())
          .on("error", (error: Error) => reject(error))
          .pipe(destination);
      });
    } catch (error) {
      logger.error({ err: error }, `Ошибка при экспорте Google Doc ${fileId}`);
      throw error;
    }
  }
}

export type GoogleRepositoryType = GoogleRepository;

export default new GoogleRepository();
