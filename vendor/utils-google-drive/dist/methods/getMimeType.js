'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMimeType = void 0;
const utilsMethods_1 = require("../utils/utilsMethods");
/**
 * Get the MIME type of a file or folder in Google Drive.
 */
async function getMimeType(identifiers) {
    const fileId = await (0, utilsMethods_1.resolveId)(this, identifiers);
    const data = await this.getFiles({
        fileId,
        fields: 'mimeType',
    });
    return data.mimeType;
}
exports.getMimeType = getMimeType;
