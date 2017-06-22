/*global phantom*/
'use strict';

var system  = require('system');
var webpage = require('webpage');

var page             = webpage.create();
var errd             = false;
var preErr           = '[ERR]';
var preOut           = '[OUT]';
var baseUrl          = 'http://localhost:' + system.env.PHANTOMIC_PORT;
var debug            = system.env.PHANTOMIC_DEBUG;
var brout            = system.env.PHANTOMIC_BROUT;
var viewportWidth    = system.env.PHANTOMIC_VIEWPORTWIDTH;
var viewportHeight   = system.env.PHANTOMIC_VIEWPORTHEIGHT;
var viewportSize     = {};
var lastLog          = Date.now();
var done             = false;
var flags            = [];

if (debug) {
  system.stderr.write('PHANTOMIC_DEBUG');
  flags.push('debug');
}
if (brout) {
  flags.push('brout');
}

var url = baseUrl;
if (flags.length) {
  url += '?' + flags.join('&');
}

function exit() {
  done = true;
  var code = errd ? 1 : 0;
  if (debug) {
    phantom.debugExit(code);
  } else {
    setTimeout(function () {
      phantom.exit(code);
    }, 0);
  }
}

page.onConsoleMessage = function (msg) {
  if (msg.indexOf(preErr) === 0) {
    errd = true;
    lastLog = Date.now();
    system.stdout.write(msg.substring(preErr.length));
    return;
  }
  if (msg.indexOf(preOut) === 0) {
    lastLog = Date.now();
    system.stdout.write(msg.substring(preOut.length));
    return;
  }
  if (msg.indexOf('[EXIT ') === 0) {
    if (msg !== '[EXIT 0]') {
      errd = true;
    }
    exit();
    return;
  }
  if (msg === '[TEST_EXIT]') {
    if (!done && Date.now() - lastLog > 500) {
      exit();
    }
  } else {
    lastLog = Date.now();
    console.log(msg);
  }
};

page.onError = function (msg, trace) {
  errd = true;
  console.log(msg);
  if (trace) {
    trace.forEach(function (t) {
      console.log('    at ' + baseUrl + '/js/bundle:' + t.line);
    });
  }
};


if (viewportHeight || viewportWidth) {
  if (viewportHeight) viewportSize.height = parseInt(viewportHeight, 10);
  if (viewportWidth) viewportSize.width = parseInt(viewportWidth, 10);
  page.viewportSize = viewportSize;
}

page.open(url);
page.navigationLocked = true;
