/*
 * min-webdriver
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global window*/
'use strict';

var brout   = require('brout');
var logs    = [];
var pending = null;

function flush() {
  pending(logs.join(''));
  logs.length = 0;
  pending = null;
}

function push(str) {
  logs.push(str);
  if (pending) {
    flush();
  }
}

window._webdriver_poll = function (callback) {
  pending = callback;
  if (logs.length) {
    flush();
  }
};

window._webdriver_manualPoll = function () {
  var str = logs.join('');
  logs = [];
  return str;
};

brout.on('out', push);
brout.on('err', push);
brout.on('exit', function (code) {
  push('\nWEBDRIVER_EXIT(' + code + ')\n');
});
