'use strict';

const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const babel = require('gulp-babel');
const ghPages = require('gulp-gh-pages');

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

gulp.task('deploy', () => gulp.src('./**/*').pipe(ghPages()));
