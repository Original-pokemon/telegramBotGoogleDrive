'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFolder = void 0;
const utils = require("../utils/utilsMethods");
/**
 * Make a folder in Google Drive.
 */
async function makeFolder(params) {
    let folderName;
    let parentIdentifiers;
    let overwrite = false;
    if (typeof params === 'string') {
        folderName = arguments[0];
    }
    else {
        ({ folderName } = params);
        if (params.parentIdentifiers)
            ({ parentIdentifiers } = params);
        if (params.overwrite)
            ({ overwrite } = params);
    }
    // get file metadata
    const parentId = await utils.resolveId(this, parentIdentifiers);
    const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
    };
    if (overwrite)
        await utils.overwrite(this, fileMetadata);
    // https://developers.google.com/drive/api/guides/folder
    const data = await this.call('files', 'create', {
        resource: fileMetadata,
        fields: 'id',
    });
    return data.id;
}
exports.makeFolder = makeFolder;
