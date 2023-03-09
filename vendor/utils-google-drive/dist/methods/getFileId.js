'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileId = void 0;
const path = require("path");
const utilsGDriveError_1 = require("../utils/utilsGDriveError");
const utilsMethods_1 = require("../utils/utilsMethods");
/**
 * Get the id of a file or folder in Google Drive.
 */
async function getFileId(identifiers) {
    let fileName;
    let parentId;
    let parentName;
    // string passed
    if (typeof identifiers === 'string') {
        // path passed
        if (identifiers.match(path.sep)) {
            return await (0, utilsMethods_1.resolveIdString)(this, identifiers);
            // fileName passed
        }
        else {
            fileName = identifiers;
        }
        // object passed
    }
    else {
        ({ fileName, parentId, parentName } = identifiers);
    }
    // build q
    let q = `name="${fileName}"`;
    if (parentId !== null && parentId !== void 0 ? parentId : parentName) {
        let p;
        if (parentId) {
            p = parentId;
        }
        else if (parentName) {
            p = await this.getFileId(parentName);
        }
        q += ` and "${p}" in parents`;
    }
    const data = await this.listFiles({ q, fields: 'files(id)' });
    const filesData = data.files;
    // check file is uniquely identified
    const nFiles = filesData.length;
    if (nFiles === 0) {
        throw new utilsGDriveError_1.UtilsGDriveError(`No files found matching identifiers specified: ${fileName}.`);
    }
    else if (nFiles > 1) {
        throw new utilsGDriveError_1.UtilsGDriveError(`Multiple files found: ${fileName}. Consider specifying parent.`);
    }
    return filesData[0].id;
}
exports.getFileId = getFileId;
