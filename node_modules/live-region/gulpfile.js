'use strict';

const gulp = require('gulp');
const mochaPhantomJS = require('gulp-mocha-phantomjs');

gulp.task('test', () => {
  return gulp
    .src('./test/runner.html')
    .pipe(mochaPhantomJS({
      reporter: 'spec'
    }));
});
