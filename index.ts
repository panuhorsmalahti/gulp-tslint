/*jshint node:true */
/*jshint nomen: true */
"use strict";

// Requires
import * as TSLint from "tslint";
import { RuleFailure } from "tslint/lib/language/rule/rule";
// import * as vinyl from "vinyl";
import * as through from "through";
const gutil = require("gulp-util");
const PluginError = gutil.PluginError;
const map = require("map-stream");
import * as path from 'path';
import * as columnify from 'columnify';

export interface PluginOptions {
    configuration?: any;
    fix?: boolean;
    formatter?: string | Function;
    formattersDirectory?: string;
    rulesDirectory?: string;
    tslint?: any;

    // ts.program, used for type checked rules
    program?: any;
}

export interface ReportOptions {
    emitError?: boolean;
    reportLimit?: number;
    summarizeFailureOutput?: boolean;
    useColors?: boolean;
}

export interface TslintFile /* extends vinyl.File */ {
    tslint: any;
    path: string;
    relative: string;
    contents: Buffer | any;

    // The following are copied from vinyl.File. vinyl.File is not used
    // since the typings .d.ts shouldn't include ambient external declarations..
    isStream(): boolean;
    isNull(): boolean;
}

export interface TslintPlugin {
    (pluginOptions?: PluginOptions): any;
    report: (options?: ReportOptions) => any;
}

/**
 * Helper function to check if a value is a function
 * @param {any} value to check whether or not it is a function
 * @returns {boolean} Returns true if the value is a function
 */
function isFunction(value: any) {
    return Object.prototype.toString.call(value) === "[object Function]";
}

/**
 * Helper function to check if a value is a string
 * @param {any} value to check whether or not it is a string
 * @returns {boolean} Returns true if the value is a string
 */
function isString(value: any) {
    return Object.prototype.toString.call(value) === "[object String]";
}

/**
 * Returns the TSLint from the options, or if not set, the default TSLint.
 * @param {PluginOptions} options
 * @returns {any} TSLint module
 */
function getTslint(options: PluginOptions) {
    if (options && options.tslint) {
        return options.tslint;
    }

    return TSLint;
}

/**
 * Log an event or error using gutil.log.
 * @param {string} message the log message.
 * @param {string} level can be "error". Optional.
 * Leave empty for the default logging type.
 */
function log(message: string, level?: string) {
    const prefix = "[" + gutil.colors.cyan("gulp-tslint") + "]";

    if (level === "error") {
        gutil.log(prefix, gutil.colors.red("error"), message);
    } else {
        gutil.log(prefix, message);
    }
}

/*
 * Convert a failure to the prose error format.
 * @param {RuleFailure} failure
 * @returns {string} The failure in the prose error formar.
 */
const proseErrorFormat = function(failure: RuleFailure) {
    const fileName = failure.getFileName();
    const failureString = failure.getFailure();
    const lineAndCharacter = failure.getStartPosition().getLineAndCharacter();
    const line = lineAndCharacter.line + 1;
    const character = lineAndCharacter.character + 1;

    return `${fileName} [${line}, ${character}]: ${failureString}`;
};

/**
 * Main plugin function
 * @param {PluginOptions} [pluginOptions] contains the options for gulp-tslint.
 * Optional.
 * @returns {any}
 */
const tslintPlugin = <TslintPlugin> function(pluginOptions?: PluginOptions) {
    let loader: any;
    let tslint: any;

    // If user options are undefined, set an empty options object
    if (!pluginOptions) {
        pluginOptions = {};
    }

    return map(function(file: TslintFile,
            cb: (error: any, file?: TslintFile) => void) {

        // Skip
        if (file.isNull()) {
            return cb(null, file);
        }

        // Stream is not supported
        if (file.isStream()) {
            return cb(new PluginError("gulp-tslint", "Streaming not supported"));
        }

        // TSLint default options
        const options = {
            fix: pluginOptions.fix || false,
            formatter: pluginOptions.formatter || "prose",
            formattersDirectory: pluginOptions.formattersDirectory || null,
            rulesDirectory: pluginOptions.rulesDirectory || null
        };

        const linter = getTslint(pluginOptions);
        if (pluginOptions.configuration === null ||
            pluginOptions.configuration === undefined ||
            isString(pluginOptions.configuration)) {

            // configuration can be a file path or null, if it's unknown
            pluginOptions.configuration = linter.Configuration.findConfiguration(
                pluginOptions.configuration || null,
                file.path
            ).results;
        }

        tslint = new linter.Linter(options, pluginOptions.program);
        tslint.lint(file.path, file.contents.toString("utf8"), pluginOptions.configuration);
        file.tslint = tslint.getResult();

        // Pass file
        cb(null, file);
    });
};

tslintPlugin.report = function(options?: ReportOptions) {
    // Notify the user that the old interface is used, this can be removed at some point
    if (isString(options)) {
        throw new Error("Deprecated interface used! See 6.0.0 changelog " +
            "https://github.com/panuhorsmalahti/gulp-tslint/blob/master/CHANGELOG.md");
    }

    // Default options
    if (!options) {
        options = {};
    }
    if (options.emitError === undefined) {
        options.emitError = true;
    }
    if (options.reportLimit === undefined) {
        // 0 or less is unlimited
        options.reportLimit = 0;
    }
    if (options.summarizeFailureOutput === undefined) {
        options.summarizeFailureOutput = false;
    }
    if (options.useColors === undefined) {
        options.useColors = false;
    }
    // Collect all files with errors
    const errorFiles: TslintFile[] = [];

    // Collect all failures
    const allFailures: RuleFailure[] = [];

    // Track how many errors have been reported
    let totalReported = 0;

    // Log formatted output for each file individually
    const reportFailures = function(file: TslintFile) {

        if (file.tslint) {
            const failureCount = file.tslint.failureCount;

            if (failureCount > 0) {
                errorFiles.push(file);
                Array.prototype.push.apply(allFailures, file.tslint.failures);
                if (options.reportLimit <= 0 || (options.reportLimit && options.reportLimit > totalReported)) { 
                    const errors = options.useColors
                        ? `${gutil.colors.red(file.tslint.failureCount)} ${gutil.colors.red('errors')}`
                        : `${file.tslint.failureCount} errors`;
                    const fileName = options.useColors
                        ? gutil.colors.cyan(file.history[0])
                        : file.history[0];
                    console.log(`\n${errors} found in ${fileName}`);

                    const columns = [];

                    for (let failure of file.tslint.failures) {
                        if (options.reportLimit > 0 &&
                            options.reportLimit <= totalReported) {
                            log(`More than ${options.reportLimit} failures reported. Turning off reporter.`);
                            break;
                        } else {
                            const lineAndCharacter = failure.getStartPosition().getLineAndCharacter();
                            const line = lineAndCharacter.line + 1;
                            const character = lineAndCharacter.character + 1;
                            const description = failure.getFailure();
                            const ruleName = failure.getRuleName();
                            columns.push({
                                line: options.useColors
                                    ? gutil.colors.magenta(line)
                                    : line,
                                char: options.useColors
                                    ? `:${gutil.colors.magenta(character)}`
                                    : character,
                                description: `${description}`,
                                rule: options.useColors 
                                    ? gutil.colors.red(ruleName) 
                                    : ruleName,
                            });
                            totalReported++;
                        }
                    }

                    console.log(columnify(columns, {
                        showHeaders: false,
                    }));
                }
            }
        }

        // Pass file
        this.emit("data", file);
    };

    /**
     * After reporting on all files, throw the error.
     */
    const throwErrors = function() {
        // Throw error
        if (options && errorFiles.length > 0) {
            let failuresToOutput = allFailures;
            let ignoreFailureCount = 0;

            // If error count is limited, calculate number of errors not shown and slice reportLimit
            // number of errors to be included in the error.
            if (options.reportLimit > 0) {
                ignoreFailureCount = allFailures.length - options.reportLimit;
                failuresToOutput = allFailures.slice(0, options.reportLimit);
            }

            // Always use the proseErrorFormat for the error.
            const failureOutput = failuresToOutput.map(function(failure) {
                return proseErrorFormat(failure);
            }).join(", ");

            let errorOutput = "Failed to lint: ";
            if (options.summarizeFailureOutput) {
                errorOutput += failuresToOutput.length + " errors.";
            } else {
                errorOutput += failureOutput + ".";
            }
            if (ignoreFailureCount > 0) {
                errorOutput += " (" + ignoreFailureCount
                    + " other errors not shown.)";
            }

            if (options.emitError === true) {
                return this.emit("error", new PluginError("gulp-tslint",
                    errorOutput));
            } else if (options.summarizeFailureOutput) {
                log(errorOutput);
            }
        }

        // Notify through that we're done
        this.emit("end");
    };

    return through(reportFailures, throwErrors);
};

export default tslintPlugin;

// ES5/ES6 fallbacks
module.exports = tslintPlugin;
module.exports.default = tslintPlugin;
