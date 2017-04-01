'use strict';

const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const babel = require('gulp-babel');

gulp.task('default', ['build']);
gulp.task('build', ['babelify']);

gulp.task('browserify', () => {
  return browserify('./index.js')
    .bundle()
    .pipe(source('combination-box.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('babelify', ['browserify'], () => {
  return gulp.src('./dist/combination-box.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
  gulp.watch(['./index.js', 'lib/**/*.js'], ['build']);
});
