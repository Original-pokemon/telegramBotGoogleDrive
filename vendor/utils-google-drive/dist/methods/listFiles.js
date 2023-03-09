'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFiles = void 0;
/**
 * Base function for calling the list method of Google Drive API's Files resource.
 * Consult https://developers.google.com/drive/api/v3/reference/files/list
 * for information on the request parameters.
 */
async function listFiles(params = {}, ignoreTrash = true) {
    if (!params.fields)
        params.fields = 'files(name, id, mimeType)';
    if (params.q && ignoreTrash) {
        const regEx = /(and)? trashed ?= ?(true|false)/;
        const matches = regEx.exec(params.q);
        if (matches)
            params.q = params.q.replace(matches[0], '');
        params.q += ' and trashed=false';
    }
    return await this.call('files', 'list', params);
}
exports.listFiles = listFiles;
