import { drive_v3 } from '@googleapis/drive';
import { UtilsGDrive } from '..';
/**
 * Base function for calling the list method of Google Drive API's Files resource.
 * Consult https://developers.google.com/drive/api/v3/reference/files/list
 * for information on the request parameters.
 */
export declare function listFiles(this: UtilsGDrive, params?: drive_v3.Params$Resource$Files$List, ignoreTrash?: boolean): Promise<drive_v3.Schema$FileList>;
