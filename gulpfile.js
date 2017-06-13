'use strict';

const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const babel = require('gulp-babel');
const o = require('gulp-open');
const mochaPhantomJS = require('gulp-mocha-phantomjs');

gulp.task('default', ['build']);
gulp.task('build', ['babelify']);

gulp.task('browserify', () => {
  return browserify('./index.js', {
    standalone: 'Combobo'
  })
    .bundle()
    .pipe(source('combobo.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('babelify', ['browserify'], () => {
  return gulp.src('./dist/combobo.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
  gulp.watch(['./index.js', 'lib/**/*.js'], ['build']);
});

gulp.task('test', ['build'], () => {
  return gulp
    .src('./test/runner.html')
    .pipe(mochaPhantomJS({
      reporter: 'nyan'
    }));
});

gulp.task('test-browser', ['build'], () => gulp.src('./test/runner.html').pipe(o()));
