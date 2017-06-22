/*global Mocha, window*/
/*
 * mocaccino.js
 *
 * Copyright (c) 2014-2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

require('brout');

Mocha.reporters.Base.window.width = JSON.parse('{{WINDOW_WIDTH}}');
Mocha.reporters.Base.symbols.dot = '.';
var grep = '{{GREP}}';
var fgrep = '{{FGREP}}';
var mocha = new Mocha({
  grep: grep.length ? grep : undefined,
  fgrep: fgrep.length ? fgrep : undefined
});
if ('{{INVERT}}' === true) {
  mocha.invert();
}
mocha.reporter('{{REPORTER}}', '{{REPORTER_OPTIONS}}');
mocha.ui('{{UI}}');
mocha.timeout('{{TIMEOUT}}');
mocha.useColors('{{USE_COLORS}}');
mocha.suite.emit('pre-require', window, '', mocha);
var t = new Date().getTime();
var y = Number('{{YIELDS}}');
mocha.suite.afterEach(function (done) {
  var now = new Date().getTime();
  if (now - t > y) {
    t = now;
    process.nextTick(done);
  } else {
    done();
  }
});

setTimeout(function () {
  Mocha.process.stdout = process.stdout;
  mocha.run(function (errs) {
    process.exit(errs ? 1 : 0);
  });
}, 1);
