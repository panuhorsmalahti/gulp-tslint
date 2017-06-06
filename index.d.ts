/// <reference types="node" />

import { PluginOptions, ReportOptions, TslintFile } from "./index"
import * as tslintPlugin from "./index"

/**
 * Main plugin function
 * @param {PluginOptions} [pluginOptions] contains the options for gulp-tslint.
 * Optional.
 * @returns {any}
 */

export = tslintPlugin;
