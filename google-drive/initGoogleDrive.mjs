import { UtilsGDrive, getTokenGDrive } from '../vendor/utils-google-drive/dist/index.js'
import * as fs from 'node:fs/promises'

async function checkToken(file) {
  try {
    await fs.access(file);
    return true
  } catch (err) {
    return false;
  }
}

async function authorize(auth) {
  const token = await checkToken(auth.token)
  if (!token) {
    await getTokenGDrive({
      pathCredentials: auth.credentials,
      pathOut: auth.token
    })
  }
  const utilsGDrive = await new UtilsGDrive({
    pathCredentials: auth.credentials,
    pathToken: auth.token
  })

  return utilsGDrive
}

async function initGoogleDrive(auth) {
  const client = await authorize(auth)
  console.log('client :>> ', client);
  client.getFileId({
    fileName: process.env.MAIN_FOLDER_NAME
  }).catch(async () => {
    const resMainFolder = await client.makeFolder({ folderName: process.env.MAIN_FOLDER_NAME })
    console.log('Success created MainFolder:', resMainFolder)
  })
}

export {
  initGoogleDrive
}