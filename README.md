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
var tslint = require('gulp-tslint');

gulp.task('tslint', function(){
      gulp.src('source.ts')
        .pipe(tslint());
});
```

By default, errors are printed to console.log using human-readable "prose" formatting.
You can also specify "json" as the formatter. The output is added to file.tslint.output.

tslint.json is attempted to be read from near the input file.

tslint.json can be supplied as a parameter by setting the configuration property.
```javascript
gulp.task('tslint-json', function(){
      gulp.src('invalid.ts')
        .pipe(tslint({
            formatter: 'json',
            configuration: {
              rules: {
                "class-name": true,
                // ...
              }
            }
        }));
});
```

All default options
```javascript
var options = {
    formatter: "prose",
    configuration: {},
    rulesDirectory: null,
    formattersDirectory: null
};
```

Development
===========

Fork this repository, run npm install and sent pull requests.