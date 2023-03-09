'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilsGDrive = exports.getTokenGDrive = exports.drive_v3 = void 0;
const limiter_1 = require("limiter");
const getDrive_1 = require("./utils/getDrive");
const batch_1 = require("./methods/batch");
const call_1 = require("./methods/call");
const del_1 = require("./methods/del");
const download_1 = require("./methods/download");
const getFileId_1 = require("./methods/getFileId");
const getFileName_1 = require("./methods/getFileName");
const getFiles_1 = require("./methods/getFiles");
const getMimeType_1 = require("./methods/getMimeType");
const listChildren_1 = require("./methods/listChildren");
const listFiles_1 = require("./methods/listFiles");
const makeFolder_1 = require("./methods/makeFolder");
const move_1 = require("./methods/move");
const rename_1 = require("./methods/rename");
const updateFiles_1 = require("./methods/updateFiles");
const upload_1 = require("./methods/upload");
var drive_1 = require("@googleapis/drive");
Object.defineProperty(exports, "drive_v3", { enumerable: true, get: function () { return drive_1.drive_v3; } });
var getTokenGDrive_1 = require("./utils/getTokenGDrive");
Object.defineProperty(exports, "getTokenGDrive", { enumerable: true, get: function () { return getTokenGDrive_1.getTokenGDrive; } });
class UtilsGDrive {
    /**
     * Base class containing utils-google-drive methods.
     *
     * The token and credentials used for authentication can be
     * provided as strings or objects during initialization (`auth.token` and `auth.credentials`).
     * Alternatively, paths to the token and credentials can be provided (`auth.pathToken` and `auth.pathCredentials`).
     *
     * The token is retreived from ./tokenGDrive.json when
     * neither `auth.token` nor `auth.pathToken` is specified.
     * Similarly, the credentials are retreived from ./credentialsGDrive.json when
     * neither `auth.credentials` nor `auth.pathCredentials` is specified.
     *
     * Use `opts.rateLimiter` and `opts.expBack` to set rate-limiting and exponential backoff behaviors for API calls.
     * The default rate limit is 1,000 requests per 100 seconds.
     * The default behavior for exponential backoff is retrying up to three times for any error thrown.
     */
    constructor(auth = {}, opts = {}) {
        if (auth === null)
            auth = {};
        // rate limit
        if (!opts.rateLimiter)
            opts.rateLimiter = { tokensPerInterval: 1000, interval: 100 * 1000 };
        this.limiter = new limiter_1.RateLimiter(opts.rateLimiter);
        // exponential backoff
        if (!opts.expBack)
            opts.expBack = {};
        this.optsExpBack = opts.expBack;
        // client
        this.drive = (0, getDrive_1.getDrive)(auth);
        // methods
        this.batch = batch_1.batch;
        this.call = call_1.call;
        this.del = del_1.del;
        this.download = download_1.download;
        this.getFileId = getFileId_1.getFileId;
        this.getFileName = getFileName_1.getFileName;
        this.getFiles = getFiles_1.getFiles;
        this.getMimeType = getMimeType_1.getMimeType;
        this.listChildren = listChildren_1.listChildren;
        this.listFiles = listFiles_1.listFiles;
        this.makeFolder = makeFolder_1.makeFolder;
        this.move = move_1.move;
        this.rename = rename_1.rename;
        this.updateFiles = updateFiles_1.updateFiles;
        this.upload = upload_1.upload;
    }
}
exports.UtilsGDrive = UtilsGDrive;
