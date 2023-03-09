'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const fs = require("fs");
const path = require("path");
const utils = require("../utils/utilsMethods");
const axios = require('axios')
const mimeTypesByExt = {
    /* eslint-disable key-spacing */
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xlsm: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
    html: 'text/html',
    htm: 'text/html',
    csv: 'text/csv',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    json: 'application/vnd.google-apps.script+json',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    pptm: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    /* eslint-enable key-spacing */
};
/**
 * Upload a file or folder to Google Drive.
 */
async function upload(params) {
    let parentId;
    let fileName;
    let urlPath;
    let overwrite;
    if (typeof params === 'string') {
        parentId = 'root';
        fileName = path.basename(urlPath);
        urlPath = params;
        overwrite = false;
    }
    else {
        parentId = await utils.resolveId(this, params.parentIdentifiers);
        ({ urlPath, fileName } = params);
        if (params.overwrite) {
            overwrite = params.overwrite;
        }
        else {
            overwrite = false;
        }
    }
           // file metadata
           const mimeType = mimeTypesByExt[path.extname(urlPath).slice(1)];
           const fileMetadata = {
               name: fileName,
               mimeType,
               parents: [parentId],
           };
           // delete old file
           if (overwrite)
               await utils.overwrite(this, fileMetadata);
           // upload new file
           return await uploadFile(this, urlPath, fileMetadata);
    
    
}
exports.upload = upload;
async function uploadFile(utilsGDrive, urlPath, fileMetadata) {
    const response = await axios.get(urlPath, {
        responseType: 'stream',
      })
    // https://developers.google.com/drive/api/guides/folder
    const data = await utilsGDrive.call('files', 'create', {
        resource: fileMetadata,
        media: {
            mimeType: fileMetadata.mimeType,
            body: response.data,
        },
        fields: 'id',
    });
    return data.id;
}
