'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFiles = void 0;
const utilsGDriveError_1 = require("../utils/utilsGDriveError");
/**
 * Base function for calling the update method of Google Drive API's Files resource.
 * Consult https://developers.google.com/drive/api/v3/reference/files/update
 * for information on the request parameters.
 */
async function updateFiles(params = {}) {
    if (!params.fileId)
        throw new utilsGDriveError_1.UtilsGDriveError('File id not specified.');
    return await this.call('files', 'update', params);
}
exports.updateFiles = updateFiles;
