'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.overwrite = exports.resolveIdString = exports.resolveId = void 0;
const path = require("path");
const utilsGDriveError_1 = require("./utilsGDriveError");
function resolveId(utilsGDrive, identifiers) {
    // default to root
    if (!identifiers)
        return 'root';
    // handle string
    if (typeof identifiers === 'string')
        return resolveIdString(utilsGDrive, identifiers);
    // pass fileId through if already specified
    if (identifiers.fileId)
        return identifiers.fileId;
    // validate identifiers
    const validIdentifiers = ['fileId', 'fileName', 'parentId', 'parentName'];
    for (const identifier of Object.keys(identifiers)) {
        if (!validIdentifiers.includes(identifier)) {
            throw new utilsGDriveError_1.UtilsGDriveError(`Invalid property name: ${identifier}`);
        }
    }
    return utilsGDrive.getFileId(identifiers);
}
exports.resolveId = resolveId;
async function resolveIdString(utilsGDrive, str) {
    const names = str.split(path.sep);
    if (names.length === 1)
        return names[0];
    let currentId = await utilsGDrive.getFileId({ fileName: names[0] });
    for (const name of names.slice(1)) {
        currentId = await utilsGDrive.getFileId({
            fileName: name,
            parentId: currentId,
        });
    }
    return currentId;
}
exports.resolveIdString = resolveIdString;
async function overwrite(utilsGDrive, fileMetadata) {
    const { name, mimeType, parents } = fileMetadata;
    const q = `name='${name}' and mimeType='${mimeType}' and '${parents[0]}' in parents and trashed=false`;
    const data = await utilsGDrive.listFiles({ q });
    if (data) {
        if (data.files.length > 0) {
            await utilsGDrive.del(data.files[0].id);
        }
    }
}
exports.overwrite = overwrite;
