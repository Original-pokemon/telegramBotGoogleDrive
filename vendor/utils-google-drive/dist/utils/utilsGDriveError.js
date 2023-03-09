'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilsGDriveError = void 0;
class UtilsGDriveError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UtilsGDriveError';
    }
}
exports.UtilsGDriveError = UtilsGDriveError;
