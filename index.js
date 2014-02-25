/*jslint node:true */
/*jslint nomen: true */

// Requires
var path = require('path');
var TSLint = require('tslint');

// Gulp
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var map = require('map-stream');

// Load rc configs
var rcloader = require('rcloader');
var RcFinder = require('rcfinder');

"use strict";


var tslintPlugin = function(options) {
    var loader = new RcFinder('tslint.json', options),
        tslint;

    return map(function (file, cb) {
        // Skip
        if (file.isNull()) {
            return cb(null, file);
        }

        // Stream is not supported
        if (file.isStream()) {
            return cb(new PluginError('gulp-tslint', 'Streaming not supported'));
        }

        tslint = new TSLint(path.basename(file.path), file.contents.toString('utf8'), options);
        file.tslint = tslint.lint();

        cb(null, file);
    });
};

module.exports = tslintPlugin;
