/**
 * Configuration for exponential backoff behavior.
 */
export interface Opts$ExpBack {
    /**
     * Function that determines whether the error thrown warrants a retry.
     */
    shouldRetry?: (err: any) => boolean;
    /**
     * The maxmium number of retries to perform.
     */
    maxRetries?: number;
}
export declare type FnExpBack = (...args: any[]) => Promise<any>;
export declare function ApplyExpBack<Fn extends FnExpBack>(fn: Fn, opts?: Opts$ExpBack): (...args: Parameters<Fn>) => Promise<Awaited<ReturnType<Fn>>>;
