import { Credentials$GoogleApi } from './getOAuth2Client';
/**
 * Parameters for getting a token for accessing Google Drive API.
 */
export interface Params$GetTokenGDrive {
    /**
     * Authentication credentials.
     */
    credentials?: string | Credentials$GoogleApi;
    /**
     * Path to file containing authentication credentials.
     */
    pathCredentials?: string;
    /**
     * OAuth 2.0 scope for accessing Google Drive API.
     * Consult https://developers.google.com/identity/protocols/oauth2/scopes
     * for details on the scopes to choose from.
     */
    scope?: string;
    /**
     * Location where token should be written.
     */
    pathOut?: string;
}
/**
 * Gets and stores a token for making calls to the Google Drive API.
 * Default scope is `https://www.googleapis.com/auth/drive` if `params.scope` isn't specified.
 * Writes to ./tokenGDrive.json if `params.pathOut` isn't specified.
 */
export declare function getTokenGDrive(params?: Params$GetTokenGDrive): Promise<void>;
