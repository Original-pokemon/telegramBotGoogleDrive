'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.rename = void 0;
const utilsMethods_1 = require("../utils/utilsMethods");
/**
 * Rename a file or folder in Google Drive.
 */
async function rename(identifiers, newName) {
    const fileId = await (0, utilsMethods_1.resolveId)(this, identifiers);
    const params = { fileId, resource: { name: newName } };
    return await this.updateFiles(params);
}
exports.rename = rename;
