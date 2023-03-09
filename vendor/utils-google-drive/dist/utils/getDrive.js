'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDrive = void 0;
const fs = require("fs");
const google = require("@googleapis/drive");
const getOAuth2Client_1 = require("./getOAuth2Client");
const utilsGDriveError_1 = require("./utilsGDriveError");
function getDrive(auth = {}) {
    const credentials = (0, getOAuth2Client_1.resolveCredentials)(auth);
    const token = resolveToken(auth);
    const oAuth2client = (0, getOAuth2Client_1.getOAuth2Client)(credentials);
    oAuth2client.setCredentials(token);
    return google.drive({ version: 'v3', auth: oAuth2client });
}
exports.getDrive = getDrive;
function resolveToken(auth = {}) {
    if (auth.token) {
        if (typeof auth.token === 'string')
            return destructToken(JSON.parse(auth.token));
        return destructToken(auth.token);
    }
    else if (auth.pathToken) {
        return getTokenFile(auth.pathToken);
    }
    else {
        try {
            return getTokenFile('tokenGDrive.json');
        }
        catch (err) {
            throw new utilsGDriveError_1.UtilsGDriveError('Token not found. Consider running the script getTokenGDrive.js included in this package.');
        }
    }
}
function getTokenFile(pathFile) {
    const token = JSON.parse(fs.readFileSync(pathFile).toString());
    return destructToken(token);
}
function destructToken(json) {
    if (Object.keys(json)[0] === 'tokens')
        return json.tokens;
    return json;
}
