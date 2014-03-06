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

gulp.task('invalid-emit', function(){
      gulp.src(['invalid.ts', 'invalid2.ts'])
        .pipe(tslint())
        .pipe(tslint.report('prose', {
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

gulp.task('invalid-noemit', function(){
      gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report('prose', {
          emitError: false
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

gulp.task('invalid-full', function(){
      gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report('full'));
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
