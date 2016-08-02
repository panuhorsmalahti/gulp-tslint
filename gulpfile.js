var gulp = require("gulp");
var gulpTslint = require("./index");
var tslint = require("tslint");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

// To enable rules that work with the type checker
var program = tslint.createProgram("./tsconfig.json");

gulp.task("default", function() {
    var tsResult = tsProject.src()
        .pipe(gulpTslint({
            formatter: "prose",
            program: program
        }))
        .pipe(gulpTslint.report({
            emitError: false
        }))
        .pipe(ts(tsProject));

    return tsResult.js.pipe(gulp.dest(__dirname));
});
