/*
 * mocaccino.js
 *
 * Copyright (c) 2014-2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var Mocha = require('mocha');
Mocha.reporters.Base.window.width = JSON.parse('{{WINDOW_WIDTH}}');
Mocha.reporters.Base.symbols.dot = '.';
var grep = '{{GREP}}';
var fgrep = '{{FGREP}}';
var _mocha = new Mocha({
  grep: grep.length ? grep : undefined,
  fgrep: fgrep.length ? fgrep : undefined
});
_mocha.ui('{{UI}}');
if ('{{INVERT}}' === true) {
  _mocha.invert();
}
_mocha.reporter('{{REPORTER}}', '{{REPORTER_OPTIONS}}');
_mocha.timeout('{{TIMEOUT}}');
_mocha.useColors('{{USE_COLORS}}');
_mocha.suite.emit('pre-require', global, '', _mocha);

setTimeout(function () {
  _mocha.run(function (errs) {
    process.exit(errs ? 1 : 0);
  });
}, 1);
