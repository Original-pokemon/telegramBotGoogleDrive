import { UtilsGDrive } from '..';
import * as utils from '../utils/utilsMethods';
/**
 * Parameters for making a folder in Google Drive.
 */
export interface Params$MakeFolder {
    /**
     * Name of folder to be created.
     */
    folderName: string;
    /**
     * Identifiers of parent folder where the new folder should be created.
     */
    parentIdentifiers?: utils.Identifiers | string;
    /**
     * Delete any files or folders with the same name, location, and MIME type
     * as the folder to be created in Google Drive.
     */
    overwrite?: boolean;
}
/**
 * Make a folder in Google Drive.
 */
export declare function makeFolder(this: UtilsGDrive, params: Params$MakeFolder | string): Promise<string>;
