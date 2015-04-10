/*jshint node:true */
/*jshint nomen: true */
"use strict";

// Requires
var path = require('path');
var TSLint = require('tslint');

// Gulp
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var map = require('map-stream');
var through = require('through');

// Load rc configs
var Rcloader = require('rcloader');

// Helper function
function isFunction(f) {
    return Object.prototype.toString.call(f) === '[object Function]';
}

/*
 * Main plugin function
 */
var tslintPlugin = function(pluginOptions) {
    var loader;
    var tslint;

    // If user options are undefined, set an empty options object
    if (!pluginOptions) {
        pluginOptions = {};
    }

    // Create rcloader to load tslint.json
    loader = new Rcloader('tslint.json', pluginOptions.configuration);

    return map(function(file, cb) {
        // Skip
        if (file.isNull()) {
            return cb(null, file);
        }

        // Stream is not supported
        if (file.isStream()) {
            return cb(new PluginError('gulp-tslint', 'Streaming not supported'));
        }

        // Finds the config file closest to the linted file
        loader.for(file.path, function(error, fileopts) {
            // TSLint default options
            var options = {
                formatter: 'json',
                configuration: fileopts,
                rulesDirectory: pluginOptions.rulesDirectory || null,
                formattersDirectory: null // not used, use reporters instead
            };

            if (error) {
                return cb(error, undefined);
            }

            tslint = new TSLint(file.relative, file.contents.toString('utf8'), options);
            file.tslint = tslint.lint();

            // Pass file
            cb(null, file);
        });


    });
};

var gulpTslintLog = console.log;

var gutilLogger = function(message) {
    var prefix = "[" + gutil.colors.cyan("gulp-tslint") + "]";
    gutil.log(prefix, gutil.colors.red("error"), message);
}

/*
 * Convert a failure to the prose error format
 */
var proseErrorFormat = function(failure) {
    return failure.name + '[' + failure.startPosition.line + ', ' + failure.startPosition.character + ']: ' + failure.failure;
};

/*
 * Define default reporters
 */
var jsonReporter = function(failures) {
    gulpTslintLog(JSON.stringify(failures));
};

var proseReporter = function(failures) {
    failures.forEach(function(failure) {
        gulpTslintLog(proseErrorFormat(failure));
    });
};

var verboseReporter = function(failures) {
    failures.forEach(function(failure) {
        gulpTslintLog('(' + failure.ruleName + ') ' + failure.name +
            '[' + failure.startPosition.line + ', ' + failure.startPosition.character + ']: ' + failure.failure);
    });
};

// Like verbose, but prints full path
var fullReporter = function(failures, file) {
    failures.forEach(function(failure) {
        gulpTslintLog('(' + failure.ruleName + ') ' + file.path +
            '[' + failure.startPosition.line + ', ' + failure.startPosition.character + ']: ' + failure.failure);
    });
};


/* Output is in the following form:
 * [{
 *   "name": "invalid.ts",
 *   "failure": "missing whitespace",
 *   // Lines and characters start from 1
 *   "startPosition": {"position": 8, "line": 1, "character": 9},
 *   "endPosition": {"position": 9, "line": 1, "character": 10},
 *   "ruleName": "one-line"
 * }]
 */
tslintPlugin.report = function(reporter, options) {
    // Default options
    if (!options) {
        options = {};
    }
    if (options.emitError === undefined) {
        options.emitError = true;
    }
    if (options.reportLimit === undefined) {
        options.reportLimit = 0; // 0 or less is unlimited
    }
    if (options.logger !== undefined && options.logger === "gutil") {
        gulpTslintLog = gutilLogger;
    }

    // Collect all files with errors
    var errorFiles = [];

    // Collect all failures
    var allFailures = [];

    // Track how many errors have been reported
    var totalReported = 0;

    // Run the reporter for each file individually
    var reportFailures = function(file) {
        var failures = JSON.parse(file.tslint.output);
        if (failures.length > 0) {
            errorFiles.push(file);
            Array.prototype.push.apply(allFailures, failures);

            if (options.reportLimit <= 0 || (options.reportLimit && options.reportLimit > totalReported)) {
                totalReported += failures.length;
                if (reporter === 'json') {
                    jsonReporter(failures, file, options);
                } else if (reporter === 'prose') {
                    proseReporter(failures, file, options);
                } else if (reporter === 'verbose') {
                    verboseReporter(failures, file, options);
                } else if (reporter === 'full') {
                    fullReporter(failures, file, options);
                } else if (isFunction(reporter)) {
                    reporter(failures, file, options);
                }

                if (options.reportLimit > 0 && options.reportLimit <= totalReported) {
                    gulpTslintLog('More than ' + options.reportLimit + ' failures reported. Turning off reporter.');
                }
            }
        }

        // Pass file
        this.emit('data', file);
    };

    // After reporting on all files, throw the error
    var throwErrors = function() {
        // Throw error
        if (options && options.emitError === true && errorFiles.length > 0) {
            var failuresToOutput = allFailures;
            var ignoreFailureCount = 0;

            // If error count is limited, calculate number of errors not shown and slice reportLimit
            // number of errors to be included in the error.
            if (options.reportLimit > 0) {
                ignoreFailureCount = allFailures.length - options.reportLimit;
                failuresToOutput = allFailures.slice(0, options.reportLimit);
            }

            // Always use the proseErrorFormat for the error.
            var failureOutput = failuresToOutput.map(function(failure) {
                return proseErrorFormat(failure);
            }).join(', ');

            var errorOutput = 'Failed to lint: ' + failureOutput + '.';
            if (ignoreFailureCount > 0) {
                errorOutput += ' (' + ignoreFailureCount + ' other errors not shown.)';
            }
            return this.emit('error', new PluginError('gulp-tslint', errorOutput));
        }

        // Notify through that we're done
        this.emit('end');
    };

    return through(reportFailures, throwErrors);
};

module.exports = tslintPlugin;
