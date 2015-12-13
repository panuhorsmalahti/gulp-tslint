"use strict";
var TSLint = require("tslint");
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var map = require('map-stream');
var through = require('through');
var Rcloader = require('rcloader');
function isFunction(value) {
    return Object.prototype.toString.call(value) === '[object Function]';
}
function getTslint(options) {
    if (options && options.tslint) {
        return options.tslint;
    }
    return TSLint;
}
function log(message, level) {
    var prefix = "[" + gutil.colors.cyan("gulp-tslint") + "]";
    if (level === "error") {
        gutil.log(prefix, gutil.colors.red("error"), message);
    }
    else {
        gutil.log(prefix, message);
    }
}
var proseErrorFormat = function (failure) {
    return failure.name + '[' + (failure.startPosition.line + 1) + ', ' +
        (failure.startPosition.character + 1) + ']: ' + failure.failure;
};
var tslintPlugin = function (pluginOptions) {
    var loader;
    var tslint;
    if (!pluginOptions) {
        pluginOptions = {};
    }
    loader = new Rcloader('tslint.json', pluginOptions.configuration);
    return map(function (file, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }
        if (file.isStream()) {
            return cb(new PluginError('gulp-tslint', 'Streaming not supported'));
        }
        loader.for(file.path, function (error, fileOptions) {
            var options = {
                formatter: 'json',
                configuration: fileOptions,
                rulesDirectory: pluginOptions.rulesDirectory || null,
                formattersDirectory: null
            };
            if (error) {
                return cb(error, undefined);
            }
            var linter = getTslint(pluginOptions);
            tslint = new linter(file.relative, file.contents.toString('utf8'), options);
            file.tslint = tslint.lint();
            cb(null, file);
        });
    });
};
var jsonReporter = function (failures) {
    log(JSON.stringify(failures), "error");
};
var proseReporter = function (failures) {
    failures.forEach(function (failure) {
        log(proseErrorFormat(failure), "error");
    });
};
var verboseReporter = function (failures) {
    failures.forEach(function (failure) {
        log('(' + failure.ruleName + ') ' + failure.name +
            '[' + (failure.startPosition.line + 1) + ', ' +
            (failure.startPosition.character + 1) + ']: ' +
            failure.failure, "error");
    });
};
var fullReporter = function (failures, file) {
    failures.forEach(function (failure) {
        log('(' + failure.ruleName + ') ' + file.path +
            '[' + (failure.startPosition.line + 1) + ', ' +
            (failure.startPosition.character + 1) + ']: ' +
            failure.failure, "error");
    });
};
var msbuildReporter = function (failures, file) {
    failures.forEach(function (failure) {
        var positionTuple = "(" + (failure.startPosition.line + 1) + "," +
            (failure.startPosition.character + 1) + ")";
        console.log(file.path + positionTuple + ": warning " + failure.ruleName + ": " + failure.failure);
    });
};
tslintPlugin.proseErrorFormat = proseErrorFormat;
tslintPlugin.report = function (reporter, options) {
    if (!options) {
        options = {};
    }
    if (options.emitError === undefined) {
        options.emitError = true;
    }
    if (options.reportLimit === undefined) {
        options.reportLimit = 0;
    }
    if (options.summarizeFailureOutput === undefined) {
        options.summarizeFailureOutput = false;
    }
    var errorFiles = [];
    var allFailures = [];
    var totalReported = 0;
    var reportFailures = function (file) {
        var failures = JSON.parse(file.tslint.output);
        if (failures.length > 0) {
            errorFiles.push(file);
            Array.prototype.push.apply(allFailures, failures);
            if (options.reportLimit <= 0 || (options.reportLimit && options.reportLimit > totalReported)) {
                totalReported += failures.length;
                if (reporter === 'json') {
                    jsonReporter(failures);
                }
                else if (reporter === 'prose') {
                    proseReporter(failures);
                }
                else if (reporter === 'verbose') {
                    verboseReporter(failures);
                }
                else if (reporter === 'full') {
                    fullReporter(failures, file);
                }
                else if (reporter === 'msbuild') {
                    msbuildReporter(failures, file);
                }
                else if (isFunction(reporter)) {
                    reporter(failures, file, options);
                }
                if (options.reportLimit > 0 && options.reportLimit <= totalReported) {
                    log('More than ' + options.reportLimit + ' failures reported. Turning off reporter.');
                }
            }
        }
        this.emit('data', file);
    };
    var throwErrors = function () {
        if (options && errorFiles.length > 0) {
            var failuresToOutput = allFailures;
            var ignoreFailureCount = 0;
            if (options.reportLimit > 0) {
                ignoreFailureCount = allFailures.length - options.reportLimit;
                failuresToOutput = allFailures.slice(0, options.reportLimit);
            }
            var failureOutput = failuresToOutput.map(function (failure) {
                return proseErrorFormat(failure);
            }).join(', ');
            var errorOutput = 'Failed to lint: ';
            if (options.summarizeFailureOutput) {
                errorOutput += failuresToOutput.length + ' errors.';
            }
            else {
                errorOutput += failureOutput + '.';
            }
            if (ignoreFailureCount > 0) {
                errorOutput += ' (' + ignoreFailureCount + ' other errors not shown.)';
            }
            if (options.emitError === true) {
                return this.emit('error', new PluginError('gulp-tslint', errorOutput));
            }
            else if (options.summarizeFailureOutput) {
                log(errorOutput);
            }
        }
        this.emit('end');
    };
    return through(reportFailures, throwErrors);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = tslintPlugin;
module.exports = tslintPlugin;
