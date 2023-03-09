import { drive_v3 } from '@googleapis/drive';
import { UtilsGDrive } from '..';
import { Identifiers } from '../utils/utilsMethods';
/**
 * List information on a parent folder's children in Google Drive.
 */
export declare function listChildren(this: UtilsGDrive, identifiers: Identifiers | string, fields?: string): Promise<drive_v3.Schema$File[]>;
