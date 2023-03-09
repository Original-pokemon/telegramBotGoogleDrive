'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = void 0;
const gaxios = require("gaxios");
const fs = require("fs");
const refreshTokenOpts = {
    url: 'https://accounts.google.com/o/oauth2/token',
    method: 'POST',
};
async function refreshAccessToken(utilsGDrive) {
    const oAuth2Client = utilsGDrive.drive.permissions.context._options
        .auth;
    refreshTokenOpts.body = JSON.stringify({
        client_id: oAuth2Client._clientId,
        client_secret: oAuth2Client._clientSecret,
        refresh_token: oAuth2Client.credentials.refresh_token,
        grant_type: 'refresh_token',
    });
    const res = await gaxios.request(refreshTokenOpts);
    const tokenGDrive = JSON.parse(fs.readFileSync('tokenGDrive.json').toString());
    tokenGDrive.access_token = res.data.access_token;
    const expiryDate = new Date().getTime() + res.data.expires_in - 60;
    tokenGDrive.expiry_date = expiryDate;
    fs.writeFileSync('tokenGDrive.json', JSON.stringify(tokenGDrive));
    return tokenGDrive.access_token;
}
exports.refreshAccessToken = refreshAccessToken;
