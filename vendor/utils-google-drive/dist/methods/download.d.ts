import { UtilsGDrive } from '..';
import { Identifiers } from '../utils/utilsMethods';
/**
 * Identifiers for file to be downloaded.
 */
export interface Identifiers$Download extends Identifiers {
    /**
     * MIME type of file to be downloaded.
     */
    mimeType: string;
}
/**
 * Download a file or folder in Google Drive.
 */
export declare function download(this: UtilsGDrive, identifiers: Identifiers$Download | string, pathOut?: string): Promise<void>;
