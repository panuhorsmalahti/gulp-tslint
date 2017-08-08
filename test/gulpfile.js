/*
 * These test are run manually. For example, run 'gulp invalid-emit', and look at the output.
 * Specify what the output should be before the task.
 * TODO: Make these into proper tests
 */

// Simple Gulpfile
var gulp = require("gulp");
var gutil = require("gulp-util");

// File output example
var map = require("map-stream");
var concat = require("gulp-concat");

// Gulp plugins
var tslint = require("../index");

// Prints nothing
gulp.task("valid", function() {
    return gulp.src("valid.ts")
        .pipe(tslint({
            formatter: "json"
        }))
        .pipe(tslint.report());
});

gulp.task("missing", function() {
    return gulp.src("missing_file.ts")
        .pipe(tslint({
            formatter: "json"
        }))
        .pipe(tslint.report());
});

// Should print no errors
gulp.task("template", function() {
    return gulp.src("template-strings.ts")
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report());
});

// Should emit the error
gulp.task("invalid-emit", function() {
    return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report({
            emitError: true
        }));
});

// Should emit the error using the prose formatter
gulp.task("invalid-emit-default-formatter", function() {
    return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint())
        .pipe(tslint.report({
            emitError: true
        }));
});

gulp.task("invalid-emit-checkstyle-formatter", function() {
    return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint({
            formatter: "checkstyle"
        }))
        .pipe(tslint.report({
            emitError: true
        }));
});

gulp.task("invalid-emit-vso-formatter", function() {
    return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint({
            formatter: "vso"
        }))
        .pipe(tslint.report({
            emitError: true
        }));
});

gulp.task("invalid-emit-pmd-formatter", function() {
    return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint({
            formatter: "pmd"
        }))
        .pipe(tslint.report({
            emitError: true
        }));
});

gulp.task("invalid-emit-checkstyle-formatter", function() {
    return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint({
            formatter: "checkstyle"
        }))
        .pipe(tslint.report({
            emitError: true
        }));
});

gulp.task("invalid-relative", function() {
    return gulp.src(["relative/invalid.ts"], {
        base: __dirname
    })
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report({
            emitError: true
        }));
});

gulp.task("invalid-emit-return", function() {
    return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report({
            emitError: true
        }));
});

gulp.task("invalid-emptyoptions", function() {
    return gulp.src("invalid.ts")
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report({}));
});

// Should not emit the error
gulp.task("invalid-noemit", function() {
    return gulp.src("invalid.ts")
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report({
            emitError: false
        }));
});

// Example on output to file
gulp.task("output-to-file", function() {
    return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(map(function(file, done) {
            // Add the tslint errors in prose format
            if (file.tslint.output) {
                // TODO
                const output = file.tslint.output.replace(/\n\n$/g, "\n");
                file.contents = new Buffer(output);
            } else {
                file.contents = new Buffer("");
            }

            done(null, file);
        }))
        // Concat and save the errors
        .pipe(concat("tslint-report.txt"))
        .pipe(gulp.dest("./"));
});

// Should summarize failures with emitError: true
gulp.task("invalid-summarize", function() {
    return gulp.src("invalid.ts")
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report({
            emitError: true,
            summarizeFailureOutput: true
        }));
});

// Should summarize failures with emitError: false
gulp.task("invalid-summarize-no-emit", function() {
    return gulp.src("invalid.ts")
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report({
            emitError: false,
            summarizeFailureOutput: true
        }));
});

// Should not emit errors
gulp.task("custom-tslint-no-errors", function() {
    // A mocked tslint module
    var mocked = {};
    mocked.Linter = function() {
        this.lint = function() {
            this.result = {
                errorCount: 0,
                failures: [],
                format: "prose",
                output: "\n",
                warningCount: 0 
            }
        };
        this.getResult = () => {
            return this.result;
        }
    };
    mocked.Configuration = {};
    mocked.Configuration.findConfiguration = function() { return {}; };

    return gulp.src("invalid.ts")
        .pipe(tslint({
            tslint: mocked,
            formatter: "prose"
        }))
        .pipe(tslint.report());
});

// Should emit errors
gulp.task("custom-tslint-errors", function() {
    // A mocked tslint module
    var mocked = {};
    mocked.Linter = function() {
        var result;
        this.lint = function() {
            result = {
                errorCount: 1,
                failures: 
                [ {
                    fileName: '/Users/test/gulp-tslint/test/invalid.ts',
                    ruleSeverity: 'ERROR',
                    getFileName: () => "/Users/test/gulp-tslint/test/invalid.ts",
                    getFailure: () => "Missing semicolon",
                    getStartPosition: () => ({ getLineAndCharacter: () => ({ line: 10, character: 99 }) })
                    }],
                format: 'prose',
                output: '\nERROR: /Users/test/Projects/gulp-tslint/test/invalid.ts[1, 33]: Missing semicolon\n',
                warningCount: 0 
            }
        };
        this.getResult = function() {
            return result;
        }
    };
    mocked.Configuration = {};
    mocked.Configuration.findConfiguration = function() { return {}; };

    return gulp.src("invalid.ts")
        .pipe(tslint({
            tslint: mocked,
            formatter: "prose"
        }))
        .pipe(tslint.report());
});

// Unit test for the reportLimit setting.
// Should report all the 8 errors for invalid.ts, then turn off reporting.
// The emited error message should display reportLimit number of errors (2).
gulp.task("invalid-report-limit", function(){
    return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report({
            reportLimit: 2
        }));
});

// reportLimit 0 means that there's no limit. Should report all errors.
gulp.task("invalid-report-limit-zero", function() {
      return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report({
            reportLimit: 0
        }));
});

// Should turn off reporter after processing one file and shouldn't emit an error.
gulp.task("invalid-report-limit-one", function() {
    return gulp.src(["invalid2.ts", "invalid.ts"])
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report({
            reportLimit: 1,
            emitError: false
        }));
});

// Should never reach the reportLimit
gulp.task("invalid-report-limit-thousand", function() {
    return gulp.src(["invalid2.ts", "invalid.ts"])
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report({
            reportLimit: 1000,
            emitError: true
        }));
});

// Should use the checkstyle formatter
gulp.task("invalid-checkstyle", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint({
            formatter: "checkstyle"
        }))
        .pipe(tslint.report());
});

// Should use the json formatter
gulp.task("invalid-json", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint({
            formatter: "json"
        }))
        .pipe(tslint.report());
});

// Should use the msbuild formatter
gulp.task("invalid-msbuild", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint({
            formatter: "msbuild"
        }))
        .pipe(tslint.report());
});

// Should use the pmd formatter
gulp.task("invalid-pmd", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint({
            formatter: "pmd"
        }))
        .pipe(tslint.report());
});

// Should use the prose formatter
gulp.task("invalid-prose", function() {
    return gulp.src("invalid.ts")
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report());
});

// Should use the verbose formatter
gulp.task("invalid-verbose", function() {
    return gulp.src("invalid.ts")
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

// Should use the VSO formatter
// Note: This test requires TSLint v3.11.0.
gulp.task("invalid-vso", function() {
    return gulp.src("invalid.ts")
        .pipe(tslint({
            formatter: "vso"
        }))
        .pipe(tslint.report());
});

gulp.task("no-custom-rules-defined", function() {
    return gulp.src("customRule.ts")
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

gulp.task("custom-rules-defined", function() {
    return gulp.src("customRule.ts")
        .pipe(tslint({
            rulesDirectory: "rules/",
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

// Shouldn't report errors
gulp.task("forof", function() {
    return gulp.src("forof.ts")
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report());
});

// Shouldn't report errors because invalid.ts doesn't break the class-name rule
gulp.task("invalid-json-rules", function() {
    return gulp.src("invalid.ts")
        .pipe(tslint({
            configuration: {
                rules: {
                  "class-name": true
                }
            },
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

// Should report nothing, since a local tslint.json disables all rules,
// even though local-tslint/invalid.ts contains lint errors.
gulp.task("local-tslint", function() {
    return gulp.src("local-tslint/invalid.ts")
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

// Should report nothing, since a local settings.json disables all rules,
// even though custom-rules-file/invalid.ts contains lint errors.
gulp.task("custom-rules-file", function() {
    return gulp.src("custom-rules-file/invalid.ts")
        .pipe(tslint({
            configuration: "custom-rules-file/settings.json",
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});


// Should report warnings and succeed since warnings are allowed.
gulp.task("warnings-allowed", function() {
    return gulp.src("warnings/warnings.ts")
        .pipe(tslint({
            configuration: "warnings/tslint.json",
            formatter: "verbose"
        }))
        .pipe(tslint.report({
            allowWarnings: true
        }));
});

// Should report warnings and fail since warnings aren't allowed.
gulp.task("warnings-not-allowed", function() {
    return gulp.src("warnings/warnings.ts")
        .pipe(tslint({
            configuration: "warnings/tslint.json",
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

// Should report errors and warnings and fail since errors occur.
gulp.task("warnings-and-errors", function() {
    return gulp.src("warnings-and-errors/warnings-and-errors.ts")
        .pipe(tslint({
            configuration: "warnings-and-errors/tslint.json",
            formatter: "verbose"
        }))
        .pipe(tslint.report());
});

// Should report triple-equals error for override/source.ts
// 
// Should ignore triple-equals rule for override/suboverride1/subsource.ts
// (because of override in override/suboverride1/tslint.json)
//
// Should report semicolon error for override/suboverride1/subsource1.ts
// (from the semicolon rule in override/tslint.json via the extends in
// override/suboverride/tslint.json)
//
// Should ignore semicolon error for override/suboverride2/subsource2.ts
// (because no extends in override/suboverride2/tslint.json)
gulp.task("override", function() {
    return gulp.src([
            "override/source.ts", 
            "override/suboverride1/subsource1.ts",
            "override/suboverride2/subsource2.ts",
        ])
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report());
});

// Should report triple-equals error for override/source.ts
// 
// Should report triple-equals error for override/suboverride1/subsource.ts
// (ignoring override in tslint.json in override/suboverride1 because of
// the config file path provided in the options configuration property)
//
// Should report semicolon error for override/suboverride1/subsource1.ts
//
// Should report semicolon error for override/suboverride2/subsource2.ts
gulp.task("no-override", function() {
    return gulp.src([
            "override/source.ts", 
            "override/suboverride1/subsource1.ts",
            "override/suboverride2/subsource2.ts",
        ])
        .pipe(tslint({
            configuration: "tslint.json",
            formatter: "prose"
        }))
        .pipe(tslint.report());
});