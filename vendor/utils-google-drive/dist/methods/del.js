'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.del = void 0;
const utilsMethods_1 = require("../utils/utilsMethods");
/**
 * Delete a file or folder in Google Drive.
 */
async function del(identifiers) {
    const fileId = await (0, utilsMethods_1.resolveId)(this, identifiers);
    return await this.call('files', 'delete', { fileId });
}
exports.del = del;
