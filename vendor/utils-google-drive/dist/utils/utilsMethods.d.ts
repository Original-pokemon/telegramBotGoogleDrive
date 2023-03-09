import { UtilsGDrive } from '..';
/**
 * Values for identifying a file or folder in Google Drive.
 * `fileName` is required if `fileId` is not specified.
 * If `fileName` is specified and there are multiple files
 * or folders in Google Drive with that filename,
 * `parentId` or `parentName` should also be specified.
 */
export interface Identifiers {
    /**
     * Id of the file or folder.
     */
    fileId?: string;
    /**
     * Name of the file or folder.
     */
    fileName?: string;
    /**
     * Id of the file or folder's parent.
     */
    parentId?: string;
    /**
     * Name of the file or folder's parent.
     */
    parentName?: string;
}
export declare function resolveId(utilsGDrive: UtilsGDrive, identifiers?: Identifiers | string): string | Promise<string>;
export declare function resolveIdString(utilsGDrive: UtilsGDrive, str: string): Promise<string>;
/**
 * Metadata for identifying files and folders to be overwritten in Google Drive.
 */
export interface FileMetadata$Overwrite {
    /**
     * Name of file or folder being written or created.
     */
    name: string;
    /**
     * MIME type of file or folder beign written or created.
     */
    mimeType: string;
    /**
     * Ids of parents of file or folder being written or created.
     */
    parents: string[];
}
export declare function overwrite(utilsGDrive: UtilsGDrive, fileMetadata: FileMetadata$Overwrite): Promise<void>;
