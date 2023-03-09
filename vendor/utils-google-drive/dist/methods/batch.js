'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.batch = void 0;
const gaxios = require("gaxios");
const refreshAccessToken_1 = require("../utils/refreshAccessToken");
const utilsGDriveError_1 = require("../utils/utilsGDriveError");
const ApplyExpBack_1 = require("../utils/ApplyExpBack");
/**
 * Make a batch request.
 */
async function batch(calls) {
    if (calls.length > 100) {
        throw new utilsGDriveError_1.UtilsGDriveError(`Number of calls in batch request exceeds limit of 100: ${calls.length}`);
    }
    // refresh access token if needed
    const credentials = this.drive.permissions.context._options.auth.credentials;
    const tokenType = credentials.token_type;
    const accessToken = credentials.access_token;
    let token = [tokenType, accessToken].join(' ');
    try {
        await (0, ApplyExpBack_1.ApplyExpBack)(async () => {
            await this.limiter.removeTokens(1);
            return await gaxios.request({
                ...calls[0],
                headers: { Authorization: token },
            });
        }, this.optsExpBack)();
    }
    catch (e) {
        if (e.response.status === 401) {
            const newAccessToken = await (0, refreshAccessToken_1.refreshAccessToken)(this);
            token = [tokenType, newAccessToken].join(' ');
        }
    }
    // individual calls
    const reqTexts = [];
    for (const call of calls) {
        const reqHeaders = `${call.method} ${call.url}\n` +
            `Authorization: ${token}\n` +
            'Content-Type: application/json; charset=UTF-8';
        const reqText = reqHeaders + '\r\n\r\n' + JSON.stringify(call.data);
        reqTexts.push(reqText);
    }
    // parts
    const boundary = 'END_OF_PART';
    const partHeader = `--${boundary}\nContent-Type: application/http`;
    const partTexts = [];
    for (const reqText of reqTexts) {
        const partText = partHeader + '\n\r\n' + reqText + '\r\n';
        partTexts.push(partText);
    }
    // batch request
    const batchRequestText = partTexts.slice(0, 2).join('') + `--${boundary}--`;
    const batchResponse = await (0, ApplyExpBack_1.ApplyExpBack)(async () => {
        await this.limiter.removeTokens(1);
        return await gaxios.request({
            url: 'https://www.googleapis.com/batch/drive/v3',
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/mixed; boundary=' + boundary,
            },
            data: batchRequestText,
        });
    }, this.optsExpBack)();
    // parse batch response data
    const resData = batchResponse.data;
    const resBoundary = resData.slice(0, resData.indexOf('\r\n'));
    const responseStrings = resData.split(resBoundary).slice(1, -1);
    const responses = [];
    for (let i = 0; i < responseStrings.length; ++i) {
        const responseString = responseStrings[i];
        const statusLine = responseString.match(/HTTP.*/)[0];
        const status = Number(statusLine.match(/ .* /)[0].slice(1, -1));
        const data = JSON.parse(responseString.match(/{[^]*}/)[0]);
        const response = {
            ...calls[i],
            responseStatus: status,
            responseData: data,
        };
        responses.push(response);
    }
    return responses;
}
exports.batch = batch;
