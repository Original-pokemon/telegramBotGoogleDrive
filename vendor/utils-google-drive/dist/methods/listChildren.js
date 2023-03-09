'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.listChildren = void 0;
const utilsMethods_1 = require("../utils/utilsMethods");
/**
 * List information on a parent folder's children in Google Drive.
 */
async function listChildren(identifiers, fields = 'files(name, id, mimeType)') {
    const folderId = await (0, utilsMethods_1.resolveId)(this, identifiers);
    const listFilesParams = {
        q: `"${folderId}" in parents`,
        fields,
    };
    const data = await this.listFiles(listFilesParams);
    return data.files;
}
exports.listChildren = listChildren;
