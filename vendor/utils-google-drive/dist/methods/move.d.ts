import { drive_v3 } from '@googleapis/drive';
import { UtilsGDrive } from '..';
import { Identifiers } from '../utils/utilsMethods';
/**
 * Move a file or folder in Google Drive.
 */
export declare function move(this: UtilsGDrive, identifiers: Identifiers | string, newParentIdentifiers: Identifiers | string): Promise<drive_v3.Schema$File>;
