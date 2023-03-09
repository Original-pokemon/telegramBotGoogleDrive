'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.call = void 0;
const ApplyExpBack_1 = require("../utils/ApplyExpBack");
/* eslint-enable @typescript-eslint/indent */
/**
 * Base function for calling Google Drive API.
 * Consult https://developers.google.com/drive/api/v3/reference
 * for information on the resources and methods available.
 */
async function call(resource, method, params, opts) {
    return await (0, ApplyExpBack_1.ApplyExpBack)(async () => {
        await this.limiter.removeTokens(1);
        // @ts-expect-error
        const res = await this.drive[resource][method](params, opts);
        return res.data;
    }, this.optsExpBack)();
}
exports.call = call;
