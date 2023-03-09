import { UtilsGDrive } from '..';
import * as utils from '../utils/utilsMethods';
/**
 * Parameters for uploading a file to Google Drive.
 */
export interface Params$Upload {
    /**
     * Location of file to be uploaded.
     */
    localPath: string;
    /**
     * Identifiers of parent folder where the file should be uploaded.
     */
    parentIdentifiers?: utils.Identifiers | string;
    /**
     * Delete any files or folders with the same name, location, and MIME type as the
     * file to be uploaded in Google Drive.
     */
    overwrite?: boolean;
}
/**
 * Upload a file or folder to Google Drive.
 */
export declare function upload(this: UtilsGDrive, params: Params$Upload | string): Promise<string>;
