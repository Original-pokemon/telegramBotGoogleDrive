import { UtilsGDrive } from '..';
/**
 * An API call in a batch request.
 */
export interface Call$Batch {
    /**
     * Url for calling Google Drive API.
     */
    url: string;
    /**
     * HTTP request method.
     */
    method: 'GET' | 'HEAD' | 'POST' | 'DELETE' | 'PUT' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
    /**
     * Request body.
     */
    data?: Record<string, any>;
}
/**
 * Response from an API call in a batch request.
 */
export interface Response$Batch extends Call$Batch {
    /**
     * Response status.
     */
    responseStatus: number;
    /**
     * Response data.
     */
    responseData: Record<string, any>;
}
/**
 * Make a batch request.
 */
export declare function batch(this: UtilsGDrive, calls: Call$Batch[]): Promise<Response$Batch[]>;
