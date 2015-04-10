/*
 * These test are run manually. For example, run 'gulp invalid-emit', and look at the output.
 * Specify what the output should be before the task.
 * TODO: Make these into proper tests
 */

// Simple Gulpfile
var gulp = require('gulp');
var gutil = require('gulp-util');

// Gulp plugins
var tslint = require('../index');

var testReporter = function (output) {
    console.log('Found ' + output.length + ' errors!');
};

// Prints nothing
gulp.task('valid', function(){
    gulp.src('valid.ts')
        .pipe(tslint())
        .pipe(tslint.report('json'));
});

gulp.task('missing', function(){
    gulp.src('missing_file.ts')
        .pipe(tslint())
        .pipe(tslint.report('json'));
});

gulp.task('template', function(){
    gulp.src('template-strings.ts')
        .pipe(tslint())
        .pipe(tslint.report('prose'));
});

// Should emit the error
gulp.task('invalid-emit', function(){
    gulp.src(['invalid.ts', 'invalid2.ts'])
        .pipe(tslint())
        .pipe(tslint.report('prose', {
          emitError: true
        }));
});

gulp.task('invalid-relative', function(){
    gulp.src(['relative/invalid.ts'], {
        base: __dirname
    }).pipe(tslint())
      .pipe(tslint.report('verbose', {
          emitError: true
      }));
});

// TODO: Find why this doesn't throw an error to the command line
gulp.task('invalid-emit-return', function(){
    return gulp.src(['invalid.ts', 'invalid2.ts'])
        .pipe(tslint())
        .pipe(tslint.report('prose', {
            emitError: true
        }));
});

gulp.task('invalid-emptyoptions', function(){
      gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report('prose', {}));
});

// Should not emit the error
gulp.task('invalid-noemit', function(){
    gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report('prose', {
            emitError: false
        }));
});

// Unit test for the reportLimit setting.
// Should report all the 8 errors for invalid.ts, then turn off reporting.
// The emited error message should display reportLimit number of errors (2).
gulp.task('invalid-report-limit', function(){
      gulp.src(['invalid.ts', 'invalid2.ts'])
        .pipe(tslint())
        .pipe(tslint.report('prose', {
            reportLimit: 2
        }));
});

// reportLimit 0 means that there's no limit. Should report all errors.
gulp.task('invalid-report-limit-zero', function(){
      gulp.src(['invalid.ts', 'invalid2.ts'])
        .pipe(tslint())
        .pipe(tslint.report('prose', {
            reportLimit: 0
        }));
});

// Should turn off reporter after processing one file and shouldn't emit an error.
gulp.task('invalid-report-limit-one', function(){
      gulp.src(['invalid2.ts', 'invalid.ts'])
        .pipe(tslint())
        .pipe(tslint.report('prose', {
            reportLimit: 1,
            emitError: false
        }));
});

// Should never reach the reportLimit
gulp.task('invalid-report-limit-thousand', function(){
      gulp.src(['invalid2.ts', 'invalid.ts'])
        .pipe(tslint())
        .pipe(tslint.report('prose', {
            reportLimit: 1000,
            emitError: true
        }));
});

gulp.task('invalid-logger-gutil', function(){
      gulp.src(['invalid2.ts', 'invalid.ts'])
        .pipe(tslint())
        .pipe(tslint.report('prose', {
            logger: "gutil",
            emitError: false
        }));
});

gulp.task('invalid-logger-gutil-emit', function(){
      gulp.src(['invalid2.ts', 'invalid.ts'])
        .pipe(tslint())
        .pipe(tslint.report('prose', {
            logger: "gutil",
            emitError: true
        }));
});

gulp.task('invalid-all', function(){
    gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report('json', { emitError: false}))
        .pipe(tslint.report('prose', { emitError: false}))
        .pipe(tslint.report('verbose', { emitError: false}))
        .pipe(tslint.report('full', { emitError: false}))
        .pipe(tslint.report(testReporter, { emitError: true }));
});

// Should use the json reporter
gulp.task('invalid-json', function(){
    gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report('json'));
});

// Should use the prose repoterr
gulp.task('invalid-prose', function(){
    gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report('prose'));
});

// Should use the verbose reporter
gulp.task('invalid-verbose', function(){
    gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

// Should use the full reporter
gulp.task('invalid-full', function(){
    gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report('full'));
});

// Should use a custom reporter
gulp.task('invalid-custom', function(){
    gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report(testReporter));
});

gulp.task('no-custom-rules-defined', function(){
    gulp.src('customRule.ts')
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('custom-rules-defined', function(){
    gulp.src('customRule.ts')
        .pipe(tslint({
            rulesDirectory: 'rules/'
        }))
        .pipe(tslint.report('verbose'));
});

// Shouldn't report errors because invalid.ts doesn't break the class-name rule
gulp.task('invalid-json-rules', function(){
    gulp.src('invalid.ts')
        .pipe(tslint({
            configuration: {
                rules: {
                  "class-name": true
                }
            }
        }))
        .pipe(tslint.report('verbose'));
});
