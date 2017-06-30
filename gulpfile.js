'use strict';

const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const ghPages = require('gulp-gh-pages');

gulp.task('default', ['build']);
gulp.task('build', ['bundle']);

gulp.task('bundle', () => {
  return browserify('./index.js', {
    standalone: 'Combobo'
  })
    .transform('babelify', {
      presets: ['es2015']
    })
    .bundle()
    .pipe(source('combobo.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
  gulp.watch(['./index.js', 'lib/**/*.js'], ['build']);
});

gulp.task('deploy', () => gulp.src('./**/*').pipe(ghPages()));
