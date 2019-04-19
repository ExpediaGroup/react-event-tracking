const path = require('path');
const gulp = require('gulp');
const less = require('gulp-less');
const NpmImportPlugin = require('less-plugin-npm-import');

// -- Paths and file globs ---------

const SRC_DIR = path.join(__dirname, 'src');
const LESS_FILES = path.join(SRC_DIR, '**', '*.less');
const OUT_DIR = path.join('lib', 'transpiled');
const ESM_OUT_DIR = path.join('lib', 'esm');

// -- LessToLess Task ---------------------
// We're processing less files in order to resolve any @imports.

gulp.task('less', () => {
    return gulp.src(LESS_FILES)
        .pipe(less({
            plugins: [new NpmImportPlugin({prefix: '~'})]
        }))
        .pipe(gulp.dest(OUT_DIR))
        .pipe(gulp.dest(ESM_OUT_DIR));
});
