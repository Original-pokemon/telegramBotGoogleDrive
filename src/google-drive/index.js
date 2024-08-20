import axios from 'axios';
import { google } from 'googleapis';
import { config } from '../config.js';
import fs from 'fs/promises';
import { logger } from '../logger.js'
import { log } from 'console';

class GoogleRepository {
  constructor() {
    this.drive = null;
  }

  async init() {
    try {
      await fs.access(config.GOOGLE_APPLICATION_CREDENTIALS);
    } catch (error) {
      const errorMessage = `Google credentials file not found. The application cannot be started. Error: ${error.message}`;
      logger.fatal(errorMessage);
      process.exit(1)
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: config.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const client = await auth.getClient();
    this.drive = google.drive({ version: 'v3', auth: client });

    await this.checkMainFolderAccess();
    logger.info('Google Drive API successfully initialized.');
  }

  async checkMainFolderAccess() {
    const folderId = config.MAIN_FOLDER_ID;

    try {
      const res = await this.drive.files.get({
        fileId: folderId,
        fields: 'id, name',
      });

      console.log(`Main folder found: ${res.data.name} (ID: ${res.data.id})`);
    } catch (error) {
      if (error.code === 404) {
        logger.error('Main folder not found or access is denied.');
      } else {
        logger.error('Error accessing the main folder:', error);
      }
      throw error;
    }
  }

  async makeFolder({ folderName, parentIdentifiers }) {
    logger.debug(`Creating folder ${folderName}...`);

    const folder = await this.drive.files.create({
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentIdentifiers],
      },
      fields: 'id',
    });

    await this.drive.permissions.create({
      fileId: folder.data.id,
      resource: {
        role: 'reader',
        type: 'anyone',
      },
    });

    logger.debug(`Folder ${folderName} created.`);
    return folder.data.id;
  }

  async upload({ urlPath, fileName, parentIdentifiers }) {
    try {
      logger.debug(`Uploading file ${fileName} to Google Drive...`);
      const response = await axios.get(urlPath, {
        responseType: 'stream',
      });

      const fileMetadata = {
        name: fileName,
        parents: [parentIdentifiers],
      };

      const media = {
        mimeType: response.headers['content-type'],
        body: response.data,
      };

      const file = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      });

      await this.drive.permissions.create({
        fileId: file.data.id,
        resource: {
          role: 'reader',
          type: 'anyone',
        },
      });
      logger.debug(`File ${fileName} uploaded to Google Drive.`);
      return file.data.id;
    } catch (error) {
      logger.error('Error uploading file:', error);
      throw error;
    }
  }
}

export default new GoogleRepository();
