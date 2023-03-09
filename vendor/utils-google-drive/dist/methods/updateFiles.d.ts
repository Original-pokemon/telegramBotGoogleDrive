import { drive_v3 } from '@googleapis/drive';
import { UtilsGDrive } from '..';
/**
 * Base function for calling the update method of Google Drive API's Files resource.
 * Consult https://developers.google.com/drive/api/v3/reference/files/update
 * for information on the request parameters.
 */
export declare function updateFiles(this: UtilsGDrive, params?: drive_v3.Params$Resource$Files$Update): Promise<drive_v3.Schema$File>;
