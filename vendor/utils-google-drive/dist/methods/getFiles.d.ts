import { drive_v3 } from '@googleapis/drive';
import { UtilsGDrive } from '..';
/**
 * Base function for calling the get method of Google Drive API's Files resource.
 * Consult https://developers.google.com/drive/api/v3/reference/files/get
 * for information on the request parameters.
 */
export declare function getFiles(this: UtilsGDrive, params?: drive_v3.Params$Resource$Files$Get): Promise<drive_v3.Schema$File>;
