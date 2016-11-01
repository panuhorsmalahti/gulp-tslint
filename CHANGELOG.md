<a name="6.1.3"></a>
# 6.1.3 (2016-11-01)

- Drop support for Node.js 0.10

<a name="6.1.0"></a>
# 6.1.0 (2016-07-29)

- Allow custom formatter as a function [pull #68](https://github.com/panuhorsmalahti/gulp-tslint/pull/68).
- Allow type checked rules

<a name="6.0.0"></a>
# 6.0.0 (2016-07-09)

## Changes

- **breaking change**: Add support for custom TSLint formatters, gulp-tslint reporters have been removed.
- **breaking change**: The signature for `tslintPlugin.report` has changed to `tslintPlugin.report(options?: ReportOptions)`.
This requires e.g. the following to be changed from
```
.pipe(tslint())
.pipe(tslint.report("verbose"))
```
  to
```
.pipe(tslint({
    formatter: "verbose"
}))
.pipe(tslint.report())
```
- Custom gulp-tslint reporters will no longer work; instead users will have to make use of the TSLint equivalents.
  For more information see [pull #66](https://github.com/panuhorsmalahti/gulp-tslint/pull/66).
- **breaking change**: `tslintPlugin.ProseErrorFormat` is no longer exported.
- **breaking change**: The options passed to tslintPlugin have changed. The PluginOptions interface is now:
```
interface PluginOptions {
    configuration?: any;
    formatter?: string;
    formattersDirectory?: string;
    rulesDirectory?: string;
    tslint?: any;
}
```
- **breaking change**: "full" formatter was removed
- Added "vso", "pmd" and "checkstyle" formatters

<a name="5.0.0"></a>
# 5.0.0 (2016-04-24)

## Changes

- support for extends property

<a name="4.3.0"></a>
# 4.3.0 (2016-01-11)

## Changes

- Updated rcloader fixing overriding configuration keys: https://github.com/spalger/rcloader/issues/10

<a name="4.2.0"></a>
# 4.2.0 (2015-12-13)

## Changes

- Added "typings" support, now gulp-tslint types are automatically enabled in TypeScript
- Converted to TypeScript

<a name="4.1.0"></a>
# 4.1.0 (2015-11-29)

## Changes

- summarizeFailureOutput now works with emitError: false

<a name="4.0.0"></a>
# 4.0.0 (2015-11-27)

## Changes

- **breaking change**: Update tslint to 3.0.0
- **breaking change**: tslint is now a peer dependency

<a name="3.2.0"></a>
# 3.2.0 (2015-08-13)

## Changes

- Add the tslint option to supply a custom tslint module

<a name="3.0.0-beta"></a>
# 3.0.0-beta (2015-05-11)

## Changes

- Update tslint to use the TypeScript 1.5.0-beta compiler
- Due to changes to the typescript compiler API, old custom rules may no longer work and may need to be rewritten
- the JSON formatter's line and character positions are now back to being 0-indexed instead of 1-indexed

<a name="2.0.0"></a>
# 2.0.0 (2015-04-12)

## Changes

- Gulp util's logging used for printing errors.

<a name="1.4.0"></a>
# 1.4.1 (2014-11-13)

## Changes

- The PluginError exception now includes information about the failures
- Update tslint to 1.0.0

<a name="1.3.1"></a>
# 1.3.1 (2014-09-28)

## Changes

- Add .npmignore for reduced package size.

<a name="1.2.0"></a>
# 1.2.0 (2014-06-14)

## Changes

- Fix rulesDirectory
- Remove formattersDirectory
