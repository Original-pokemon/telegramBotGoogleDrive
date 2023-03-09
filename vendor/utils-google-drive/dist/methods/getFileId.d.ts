import { UtilsGDrive } from '..';
/**
 * Identifiers for the file to get the id of.
 */
export interface Identifiers$GetFileId {
    /**
     * Name of file to get the id of.
     */
    fileName: string;
    /**
     * Id of parent of file to get the id of.
     */
    parentId?: string;
    /**
     * Name of parent of file to get the id of.
     */
    parentName?: string;
}
/**
 * Get the id of a file or folder in Google Drive.
 */
export declare function getFileId(this: UtilsGDrive, identifiers: Identifiers$GetFileId | string): Promise<string>;
