export interface PluginOptions {
    configuration?: any;
    formatter?: string | Function;
    formattersDirectory?: string;
    rulesDirectory?: string;
    tslint?: any;
    program?: any;
}
export interface ReportOptions {
    emitError?: boolean;
    reportLimit?: number;
    summarizeFailureOutput?: boolean;
}
export interface TslintFile {
    tslint: any;
    path: string;
    relative: string;
    contents: Buffer | any;
    isStream(): boolean;
    isNull(): boolean;
}
export interface TslintPlugin {
    (pluginOptions?: PluginOptions): any;
    report: (options?: ReportOptions) => any;
}
/**
 * Main plugin function
 * @param {PluginOptions} [pluginOptions] contains the options for gulp-tslint.
 * Optional.
 * @returns {any}
 */
declare const tslintPlugin: TslintPlugin;
export default tslintPlugin;
