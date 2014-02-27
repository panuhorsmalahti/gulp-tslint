// Simple Gulpfile
var gulp = require('gulp');
var gutil = require('gulp-util');

// Gulp plugins
var tslint = require('../index');

gulp.task('valid', function(){
      gulp.src('valid.ts')
        .pipe(tslint());
});


gulp.task('invalid', function(){
      gulp.src('invalid.ts')
        .pipe(tslint());
});

gulp.task('invalid-json', function(){
      gulp.src('invalid.ts')
        .pipe(tslint({
            formatter: 'json'
        }));
});

gulp.task('invalid-json-rules', function(){
      gulp.src('invalid.ts')
        .pipe(tslint({
            formatter: 'json',
            configuration: {
              rules: {
                "class-name": true
              }
            }
        }));
});
