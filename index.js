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

"use strict";


var tslintPlugin = function(pluginOptions) {
    var loader = new rcloader('tslint.json', pluginOptions),
        tslint;

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
            // TSLint options
            var options = {
                formatter: "json",
                configuration: fileopts,
                rulesDirectory: null,
                formattersDirectory: null
            };

            if (error) {
                return cb(error, undefined);
            }

            tslint = new TSLint(path.basename(file.path), file.contents.toString('utf8'), options);
            file.tslint = tslint.lint();

            console.log(file.tslint);

            cb(null, file);
        });


    });
};

module.exports = tslintPlugin;