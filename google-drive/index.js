import axios from 'axios';
import { google } from 'googleapis';
import { config } from '../config.js';

class GoogleRepository {
  constructor() {
    this.drive = null;
  }

  async init() {
    const auth = new google.auth.GoogleAuth({
      keyFile: config.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const client = await auth.getClient();
    this.drive = google.drive({ version: 'v3', auth: client });

    await this.checkMainFolderAccess();
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
        console.error('Main folder not found or access is denied.');
      } else {
        console.error('Error accessing the main folder:', error);
      }
      throw error;
    }
  }

  async makeFolder({ folderName, parentIdentifiers }) {
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

    return folder.data.id;
  }

  async upload({ urlPath, fileName, parentIdentifiers }) {
    try {
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

      return file.data.id;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
}

export default new GoogleRepository();
