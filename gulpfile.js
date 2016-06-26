var gulp = require("gulp");
var tslint = require("./index");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task("default", function() {
    var tsResult = tsProject.src()
        .pipe(tslint({
            formatter: "prose"
        }))
        .pipe(tslint.report({
            emitError: false
        }))
        .pipe(ts(tsProject));

    return tsResult.js.pipe(gulp.dest(__dirname));
});
