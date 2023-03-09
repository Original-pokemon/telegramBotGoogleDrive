'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.move = void 0;
const utilsMethods_1 = require("../utils/utilsMethods");
/**
 * Move a file or folder in Google Drive.
 */
async function move(identifiers, newParentIdentifiers) {
    const fileId = await (0, utilsMethods_1.resolveId)(this, identifiers);
    const data = await this.getFiles({ fileId, fields: 'parents' });
    const oldParentId = data.parents[0];
    const newParentId = await (0, utilsMethods_1.resolveId)(this, newParentIdentifiers);
    const params = {
        fileId,
        removeParents: oldParentId,
        addParents: newParentId,
    };
    return await this.updateFiles(params);
}
exports.move = move;
