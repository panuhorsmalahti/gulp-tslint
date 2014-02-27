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
    var loader,
        tslint;

    // If user options are undefined, set an empty options object
    if (!pluginOptions) {
        pluginOptions = {};
    }

    // Create rcloader
    loader = new rcloader('tslint.json', pluginOptions.configuration);

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
                formatter: pluginOptions.formatter || "prose",
                configuration: fileopts,
                rulesDirectory: pluginOptions.formatter || null,
                formattersDirectory: pluginOptions.formatter || null
            };

            if (error) {
                return cb(error, undefined);
            }

            tslint = new TSLint(path.basename(file.path), file.contents.toString('utf8'), options);
            file.tslint = tslint.lint();

            if (file.tslint.output) {
                console.log(file.tslint.output);
            }

            cb(null, file);
        });


    });
};

module.exports = tslintPlugin;