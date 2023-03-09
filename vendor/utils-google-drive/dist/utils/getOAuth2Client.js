'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveCredentials = exports.getOAuth2Client = void 0;
const fs = require("fs");
const google = require("@googleapis/drive");
const utilsGDriveError_1 = require("./utilsGDriveError");
function getOAuth2Client(credentials) {
    /* eslint-disable @typescript-eslint/naming-convention */
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    /* eslint-enable @typescript-eslint/naming-convention */
    return oAuth2Client;
}
exports.getOAuth2Client = getOAuth2Client;
function resolveCredentials(auth = {}) {
    if (auth.credentials) {
        if (typeof auth.credentials === 'string')
            return JSON.parse(auth.credentials);
        return auth.credentials;
    }
    else if (auth.pathCredentials) {
        return JSON.parse(fs.readFileSync(auth.pathCredentials).toString());
    }
    else {
        try {
            return JSON.parse(fs.readFileSync('credentialsGDrive.json').toString());
        }
        catch (err) {
            throw new utilsGDriveError_1.UtilsGDriveError('Credentials not found.');
        }
    }
}
exports.resolveCredentials = resolveCredentials;
