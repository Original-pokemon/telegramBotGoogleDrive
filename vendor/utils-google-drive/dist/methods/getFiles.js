'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFiles = void 0;
const utilsGDriveError_1 = require("../utils/utilsGDriveError");
/**
 * Base function for calling the get method of Google Drive API's Files resource.
 * Consult https://developers.google.com/drive/api/v3/reference/files/get
 * for information on the request parameters.
 */
async function getFiles(params = {}) {
    if (!params.fileId)
        throw new utilsGDriveError_1.UtilsGDriveError('File id not specified.');
    if (!params.fields)
        params.fields = 'name, id, mimeType';
    return await this.call('files', 'get', params);
}
exports.getFiles = getFiles;
