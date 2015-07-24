gulp-tslint
=========

[![Build Status](https://travis-ci.org/panuhorsmalahti/gulp-tslint.svg?branch=master)](https://travis-ci.org/panuhorsmalahti/gulp-tslint)
[![Dependency Status](https://david-dm.org/panuhorsmalahti/gulp-tslint.svg)](https://david-dm.org/panuhorsmalahti/gulp-tslint)

TypeScript linter plugin for Gulp.


First install gulp-tslint
```shell
npm install --save-dev gulp-tslint
```


Usage:
```javascript
const tslint = require('gulp-tslint');

gulp.task('tslint', function(){
      return gulp.src('source.ts')
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});
```

**tslint.json** is attempted to be read from near the input file.
It **must be available** or supplied directly through the options.

The output (stringified JSON) is added to file.tslint.output.
You can output the errors by using reporters.
There are four default reporters:
* 'json' prints stringified JSON to console.log.
* 'prose' prints short human-readable failures to console.log.
* 'verbose' prints longer human-readable failures to console.log.
* 'full' is like verbose, but displays full path to the file

Reporters are executed only if there is at least one failure.

If there is at least one failure a PluginError is
emitted after execution of the reporters:
```javascript
[gulp] Error in plugin 'gulp-tslint': Failed to lint: invalid.ts
```

You can prevent emiting the error by setting emitError to false when you're
invoking the reporter.

```javascript
gulp.task('invalid-noemit', function(){
    return gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report('prose', {
          emitError: false
        }));
});
```

You can use your own reporter by supplying a function.
```javascript
/* output is in the following form:
 * [{
 *   "name": "invalid.ts",
 *   "failure": "missing whitespace",
 *   // Lines and characters start from 0
 *   "startPosition": {"position": 8, "line": 0, "character": 8},
 *   "endPosition": {"position": 9, "line": 0, "character": 9},
 *   "ruleName": "one-line"
 * }]
 */
const testReporter = function (output, file, options) {
    // file is a reference to the vinyl File object
    console.log("Found " + output.length + " errors in " + file.path);
    // options is a reference to the reporter options, e.g. options.emitError
};

gulp.task('invalid-custom', function(){
    return gulp.src('invalid.ts')
        .pipe(tslint())
        .pipe(tslint.report(testReporter));
});
```

tslint.json can be supplied as a parameter by setting the configuration property.
```javascript
gulp.task('tslint-json', function(){
    return gulp.src('invalid.ts')
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

You can optionally specify a report limit that will turn off reporting for files after the limit has been reached. If the limit is 0 or less, the limit is ignored, which is the default setting.

All default options
```javascript
const options = {
    configuration: {},
    rulesDirectory: null,
    emitError: true,
    reportLimit: 0
};
```

Development
===========

Fork this repository, run npm install and send pull requests.
