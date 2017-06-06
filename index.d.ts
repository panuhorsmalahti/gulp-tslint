/// <reference types="node" />

declare namespace tslintPlugin {

	interface PluginOptions {
		configuration?: any;
		fix?: boolean;
		formatter?: string | Function;
		formattersDirectory?: string;
		rulesDirectory?: string;
		tslint?: any;
		program?: any;
	}

	interface ReportOptions {
		emitError?: boolean;
		reportLimit?: number;
		summarizeFailureOutput?: boolean;
		allowWarnings?: boolean;
	}

	interface TslintFile {
		tslint: any;
		path: string;
		relative: string;
		contents: Buffer | any;
		isStream(): boolean;
		isNull(): boolean;
	}

	interface TslintPlugin {
		(pluginOptions?: PluginOptions): any;
		report: (options?: ReportOptions) => any;
		pluginOptions: PluginOptions;
	}

	function report(options?: ReportOptions): any;
    const pluginOptions: PluginOptions;
}

/**
 * Main plugin function
 * @param {PluginOptions} [pluginOptions] contains the options for gulp-tslint.
 * Optional.
 * @returns {any}
 */
declare function tslintPlugin(pluginOptions?: tslintPlugin.PluginOptions): any;

export = tslintPlugin;
