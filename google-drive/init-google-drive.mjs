/* eslint-disable import/no-relative-packages */
import * as fs from 'node:fs/promises';

import {
  getTokenGDrive,
  UtilsGDrive,
} from '../vendor/utils-google-drive/dist/index.js';

async function checkToken(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function authorize(auth) {
  const token = await checkToken(auth.token);
  if (!token) {
    await getTokenGDrive({
      pathCredentials: auth.credentials,
      pathOut: auth.token,
    });
  }
  const utilsGDrive = await new UtilsGDrive({
    pathCredentials: auth.credentials,
    pathToken: auth.token,
  });

  return utilsGDrive;
}

async function initGoogleDrive(auth) {
  const client = await authorize(auth);

  try {
    await client.getFileId({
      fileName: process.env.MAIN_FOLDER_NAME,
    });

    return client;
  } catch {
    const responseMainFolder = await client.makeFolder({
      folderName: process.env.MAIN_FOLDER_NAME,
    });
    console.log('Success created MainFolder:', responseMainFolder);

    await initGoogleDrive(auth);
  }
}

export { initGoogleDrive };
