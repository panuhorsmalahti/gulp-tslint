gulp-tslint
=========

Note: This is work in progress.

TypeScript linter plugin for Gulp.


First install gulp-tslint
```shell
npm install --save-dev gulp-tslint
```


Usage:
```javascript
var tslint = require('../index');

gulp.task('tslint', function(){
      gulp.src('source.ts')
        .pipe(tslint());
});
```

tslint.json can be supplied as a parameter
```javascript
gulp.task('rules', function(){
      gulp.src('invalid.ts')
        .pipe(tslint({
              "rules": {
                "class-name": true
                // ...
              }
        }));
});
```
