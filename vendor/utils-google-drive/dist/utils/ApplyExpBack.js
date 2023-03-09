'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyExpBack = void 0;
function ApplyExpBack(fn, opts) {
    if (!opts)
        opts = {};
    if (!opts.shouldRetry)
        opts.shouldRetry = () => true;
    if (!opts.maxRetries)
        opts.maxRetries = 3;
    let nRetries = 0;
    async function expBackRecursive(...args) {
        try {
            return await fn(...args);
        }
        catch (err) {
            if (!opts.shouldRetry(err))
                throw err;
            if (nRetries > opts.maxRetries - 1)
                throw err;
            const jitter = Math.random() * 3 * 1000;
            const waitMs = 2 ** nRetries * 1000 + jitter;
            nRetries++;
            return await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(expBackRecursive(...args));
                }, waitMs);
            });
        }
    }
    return expBackRecursive;
}
exports.ApplyExpBack = ApplyExpBack;
