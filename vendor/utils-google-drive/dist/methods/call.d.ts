import * as google from '@googleapis/drive';
import { UtilsGDrive } from '..';
/**
 * Possible values of `reource` parameter in `UtilsGDrive.call()` method.
 */
export declare type Resource$Call = 'about' | 'changes' | 'channels' | 'comments' | 'context' | 'drives' | 'files' | 'permissions' | 'replies' | 'revisions' | 'teamdrives';
/**
 * Possible values of `method` parameter in `UtilsGDrive.call()` method.
 */
export declare type Method$Call<T extends Resource$Call> = T extends 'about' ? 'context' | 'get' : T extends 'changes' ? 'context' | 'getStartPageToken' | 'list' | 'watch' : T extends 'channels' ? 'context' | 'stop' : T extends 'comments' ? 'context' | 'create' | 'delete' | 'list' | 'update' : T extends 'drives' ? 'context' | 'create' | 'delete' | 'get' | 'hide' | 'list' | 'unhide' | 'update' : T extends 'files' ? 'context' | 'copy' | 'create' | 'delete' | 'emptyTrash' | 'export' | 'generateIds' | 'get' | 'list' | 'update' | 'watch' : T extends 'permissions' ? 'context' | 'create' | 'delete' | 'get' | 'list' | 'update' : T extends 'replies' ? 'context' | 'create' | 'delete' | 'get' | 'list' | 'update' : T extends 'revisions' ? 'context' | 'delete' | 'get' | 'list' | 'update' : 'context' | 'create' | 'delete' | 'get' | 'list' | 'update';
/**
 * Base function for calling Google Drive API.
 * Consult https://developers.google.com/drive/api/v3/reference
 * for information on the resources and methods available.
 */
export declare function call<ParamsMethod, ReturnData, Resource extends Resource$Call>(this: UtilsGDrive, resource: Resource, method: Method$Call<Resource>, params: ParamsMethod, opts?: google.StreamMethodOptions): Promise<ReturnData>;
