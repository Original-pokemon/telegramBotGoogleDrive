'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.download = void 0;
const fs = require("fs");
const path = require("path");
const ApplyExpBack_1 = require("../utils/ApplyExpBack");
const utilsMethods_1 = require("../utils/utilsMethods");
/**
 * Download a file or folder in Google Drive.
 */
async function download(identifiers, pathOut = '.') {
    // get file id
    let fileId;
    if (typeof identifiers === 'string') {
        fileId = identifiers;
    }
    else if (identifiers.fileId) {
        fileId = identifiers.fileId;
    }
    else {
        fileId = await (0, utilsMethods_1.resolveId)(this, identifiers);
    }
    // get file name and mime type
    let fileName;
    let mimeType;
    if (typeof identifiers !== 'string' &&
        identifiers.fileName &&
        identifiers.mimeType) {
        fileName = identifiers.fileName;
        mimeType = identifiers.mimeType;
    }
    else {
        const metadata = await this.getFiles({ fileId, fields: 'name, mimeType' });
        fileName = metadata.name;
        mimeType = metadata.mimeType;
    }
    if (mimeType === 'application/vnd.google-apps.folder') {
        await handleFolderDownload(this);
    }
    else {
        await downloadFile(this, fileId, fileName, pathOut);
    }
    async function handleFolderDownload(utilsGDrive) {
        // make folder
        pathOut = path.join(pathOut, fileName);
        fs.mkdirSync(pathOut);
        // download children
        const children = await utilsGDrive.listChildren({ fileId });
        if (children) {
            const downloads = [];
            for (const child of children) {
                const identifiersChild = {
                    fileId: child.id,
                    fileName: child.name,
                    mimeType: child.mimeType,
                };
                const download = utilsGDrive.download(identifiersChild, pathOut);
                downloads.push(download);
            }
            await Promise.all(downloads);
        }
    }
}
exports.download = download;
async function downloadFile(utilsGDrive, fileId, fileName, pathOut) {
    const dest = fs.createWriteStream(path.join(pathOut, fileName));
    const params = { fileId, alt: 'media' };
    return await (0, ApplyExpBack_1.ApplyExpBack)(async () => {
        await utilsGDrive.limiter.removeTokens(1);
        const res = await utilsGDrive.drive.files.get(params, {
            responseType: 'stream',
        });
        await new Promise((resolve, reject) => {
            res.data.on('error', reject).on('end', resolve).pipe(dest);
        });
    })();
}
