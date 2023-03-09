import { drive_v3 } from '@googleapis/drive';
import { UtilsGDrive } from '..';
import { Identifiers } from '../utils/utilsMethods';
/**
 * Rename a file or folder in Google Drive.
 */
export declare function rename(this: UtilsGDrive, identifiers: Identifiers | string, newName: string): Promise<drive_v3.Schema$File>;
