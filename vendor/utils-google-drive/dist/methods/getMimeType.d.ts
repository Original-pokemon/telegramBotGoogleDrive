import { UtilsGDrive } from '..';
import { Identifiers } from '../utils/utilsMethods';
/**
 * Get the MIME type of a file or folder in Google Drive.
 */
export declare function getMimeType(this: UtilsGDrive, identifiers: Identifiers | string): Promise<string>;
