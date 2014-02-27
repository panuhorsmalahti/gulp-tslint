// Simple Gulpfile
var gulp = require('gulp');
var gutil = require('gulp-util');

// Gulp plugins
var tslint = require('../index');

var testReporter = function (output) {
    console.log("Found " + output.length + " errors!");
};

// Prints nothing
gulp.task('valid', function(){
      gulp.src('valid.ts')
        .pipe(tslint())
        .pipe(tslint.report('json'));
});

gulp.task('invalid-json', function(){
      gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report('json'));
});

gulp.task('invalid-prose', function(){
      gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report('prose'));
});

gulp.task('invalid-verbose', function(){
      gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('invalid-custom', function(){
      gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report(testReporter));
});


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
