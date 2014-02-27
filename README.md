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
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});
});
```

tslint.json is attempted to be read from near the input file.

The output (stringified JSON) is added to file.tslint.output.
You can output the errors by using reporters.
There are three default reporters: 'json', 'prose' and 'verbose'.
'json' prints stringified JSON to console.log.
'prose' prints short human-readable failures to console.log.
'verbose' prints longer human-readable failures to console.log.

You can use your own reporter by supplying a function.
```javascript
/* Output is in the following form:
 * [{
 *   "name": "invalid.ts",
 *   "failure": "missing whitespace",
 *   // Lines and characters start from 0
 *   "startPosition": {"position": 8, "line": 0, "character": 8},
 *   "endPosition": {"position": 9, "line": 0, "character": 9},
 *   "ruleName": "one-line"
 * }]
 */
var testReporter = function (output) {
    console.log("Found " + output.length + " errors!");
};

gulp.task('invalid-custom', function(){
      gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report(testReporter));
});
```

tslint.json can be supplied as a parameter by setting the configuration property.
```javascript
gulp.task('tslint-json', function(){
      gulp.src('invalid.ts')
        .pipe(tslint({
            configuration: {
              rules: {
                "class-name": true,
                // ...
              }
            }
        }))
        .pipe(tslint.report('prose'));;
});
```

All default options
```javascript
var options = {
    configuration: {},
    rulesDirectory: null,
    formattersDirectory: null
};
```

Development
===========

Fork this repository, run npm install and send pull requests.