'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileName = void 0;
/**
 * Get the name of a file or folder in Google Drive.
 */
async function getFileName(fileId) {
    const data = await this.getFiles({ fileId, fields: 'name' });
    return data.name;
}
exports.getFileName = getFileName;
