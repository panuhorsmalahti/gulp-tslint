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

var testReporter = function (output) {
    console.log("Found " + output.length + " errors!");
};

// Prints nothing
gulp.task("valid", function(){
    return gulp.src("valid.ts")
        .pipe(tslint())
        .pipe(tslint.report("json"));
});

gulp.task("missing", function(){
    return gulp.src("missing_file.ts")
        .pipe(tslint())
        .pipe(tslint.report("json"));
});

// Should print no errors
gulp.task("template", function(){
    return gulp.src("template-strings.ts")
        .pipe(tslint())
        .pipe(tslint.report("prose"));
});

// Should emit the error
gulp.task("invalid-emit", function(){
    return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint())
        .pipe(tslint.report("prose", {
          emitError: true
        }));
});

gulp.task("invalid-relative", function(){
    return gulp.src(["relative/invalid.ts"], {
        base: __dirname
    }).pipe(tslint())
      .pipe(tslint.report("verbose", {
          emitError: true
      }));
});

gulp.task("invalid-emit-return", function(){
    return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint())
        .pipe(tslint.report("prose", {
            emitError: true
        }));
});

gulp.task("invalid-emptyoptions", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint())
        .pipe(tslint.report("prose", {}));
});

// Should not emit the error
gulp.task("invalid-noemit", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint())
        .pipe(tslint.report("prose", {
            emitError: false
        }));
});

// Example on output to file
gulp.task("output-to-file", function(){
    return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint())
        .pipe(map(function(file, done) {
            // Add the tslint errors in prose format
            if (file.tslint.output) {
                file.contents = new Buffer(
                    JSON.parse(file.tslint.output)
                        .map(tslint.proseErrorFormat).join("\n")
                );
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
gulp.task("invalid-summarize", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint())
        .pipe(tslint.report("prose", {
            emitError: true,
            summarizeFailureOutput: true
        }));
});

// Should summarize failures with emitError: false
gulp.task("invalid-summarize-no-emit", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint())
        .pipe(tslint.report("prose", {
            emitError: false,
            summarizeFailureOutput: true
        }));
});

// Should not emit errors
gulp.task("custom-tslint-no-errors", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint({
            // A mocked tslint module
            tslint: function() {
                this.lint = function() {
                    return {
                        output: "[]"
                    }
                }
            }
        }))
        .pipe(tslint.report("prose"));
});

// Should emit errors
gulp.task("custom-tslint-errors", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint({
            // A mocked tslint module
            tslint: function() {
                this.lint = function() {
                    return {
                        output: JSON.stringify([{
                            name: "name",
                            ruleName: "ruleName",
                            startPosition: {
                                line: 0,
                                character: 0
                            },
                            failure: "failure"
                        }])
                    }
                }
            }
        }))
        .pipe(tslint.report("prose"));
});

// Unit test for the reportLimit setting.
// Should report all the 8 errors for invalid.ts, then turn off reporting.
// The emited error message should display reportLimit number of errors (2).
gulp.task("invalid-report-limit", function(){
    return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint())
        .pipe(tslint.report("prose", {
            reportLimit: 2
        }));
});

// reportLimit 0 means that there's no limit. Should report all errors.
gulp.task("invalid-report-limit-zero", function(){
      return gulp.src(["invalid.ts", "invalid2.ts"])
        .pipe(tslint())
        .pipe(tslint.report("prose", {
            reportLimit: 0
        }));
});

// Should turn off reporter after processing one file and shouldn't emit an error.
gulp.task("invalid-report-limit-one", function(){
    return gulp.src(["invalid2.ts", "invalid.ts"])
        .pipe(tslint())
        .pipe(tslint.report("prose", {
            reportLimit: 1,
            emitError: false
        }));
});

// Should never reach the reportLimit
gulp.task("invalid-report-limit-thousand", function(){
      gulp.src(["invalid2.ts", "invalid.ts"])
        .pipe(tslint())
        .pipe(tslint.report("prose", {
            reportLimit: 1000,
            emitError: true
        }));
});

gulp.task("invalid-all", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint())
        .pipe(tslint.report("json", { emitError: false}))
        .pipe(tslint.report("prose", { emitError: false}))
        .pipe(tslint.report("verbose", { emitError: false}))
        .pipe(tslint.report("full", { emitError: false}))
        .pipe(tslint.report(testReporter, { emitError: true }));
});

// Should use the json reporter
gulp.task("invalid-json", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint())
        .pipe(tslint.report("json"));
});

// Should use the prose repoterr
gulp.task("invalid-prose", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint())
        .pipe(tslint.report("prose"));
});

// Should use the verbose reporter
gulp.task("invalid-verbose", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint())
        .pipe(tslint.report("verbose"));
});

// Should use the full reporter
gulp.task("invalid-full", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint())
        .pipe(tslint.report("full"));
});

// Should use a custom reporter
gulp.task("invalid-custom", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint())
        .pipe(tslint.report(testReporter));
});

gulp.task("no-custom-rules-defined", function(){
    return gulp.src("customRule.ts")
        .pipe(tslint())
        .pipe(tslint.report("verbose"));
});

gulp.task("custom-rules-defined", function(){
    return gulp.src("customRule.ts")
        .pipe(tslint({
            rulesDirectory: "rules/"
        }))
        .pipe(tslint.report("verbose"));
});

// Shouldn't report errors
gulp.task("forof", function(){
    return gulp.src("forof.ts")
        .pipe(tslint())
        .pipe(tslint.report("prose"));
});

// Shouldn't report errors because invalid.ts doesn't break the class-name rule
gulp.task("invalid-json-rules", function(){
    return gulp.src("invalid.ts")
        .pipe(tslint({
            configuration: {
                rules: {
                  "class-name": true
                }
            }
        }))
        .pipe(tslint.report("verbose"));
});
