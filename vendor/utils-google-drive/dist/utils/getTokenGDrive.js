'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenGDrive = void 0;
const fs = require("fs");
const readline = require("readline");
const getOAuth2Client_1 = require("./getOAuth2Client");
/**
 * Gets and stores a token for making calls to the Google Drive API.
 * Default scope is `https://www.googleapis.com/auth/drive` if `params.scope` isn't specified.
 * Writes to ./tokenGDrive.json if `params.pathOut` isn't specified.
 */
async function getTokenGDrive(params = {}) {
    let scope;
    params.scope
        ? (scope = params.scope)
        : (scope = 'https://www.googleapis.com/auth/drive');
    let pathOut;
    params.pathOut ? (pathOut = params.pathOut) : (pathOut = 'tokenGDrive.json');
    const credentials = (0, getOAuth2Client_1.resolveCredentials)(params);
    const oAuth2Client = (0, getOAuth2Client_1.getOAuth2Client)(credentials);
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [scope],
    });
    console.log('Authorize this app by visiting this url:\n\n' + authUrl + '\n');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return await new Promise((resolve, reject) => {
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client
                .getToken(code)
                .then((token) => {
                fs.writeFileSync(pathOut, JSON.stringify(token));
                console.log(`Token stored to ${pathOut}\n`);
                resolve();
            })
                .catch((err) => reject(err));
        });
    });
}
exports.getTokenGDrive = getTokenGDrive;
