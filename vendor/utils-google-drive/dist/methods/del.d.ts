import { UtilsGDrive } from '..';
import { Identifiers } from '../utils/utilsMethods';
/**
 * Delete a file or folder in Google Drive.
 */
export declare function del(this: UtilsGDrive, identifiers: Identifiers | string): Promise<undefined>;
