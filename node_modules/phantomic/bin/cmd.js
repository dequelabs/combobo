#!/usr/bin/env node
'use strict';

var phantomic = require('../lib/phantomic.js');

var args = process.argv.slice(2);
var arg;
var opts = {
  debug : false,
  brout : false,
  port  : 0
};
var input = process.stdin;

while (args.length && args[0][0] === '-') {
  arg = args.shift();
  if (arg === '--debug') {
    opts.debug = true;
  } else if (arg === '--port') {
    opts.port = parseInt(args.shift(), 10);
  } else if (arg === '--viewport-width') {
    opts['viewport-width'] = parseInt(args.shift(), 10);
  } else if (arg === '--viewport-height') {
    opts['viewport-height'] = parseInt(args.shift(), 10);
  } else if (arg === '--brout') {
    opts.brout = true;
  } else if (arg === '--phantomjs') {
    opts.phantomjs = args.shift();
  } else if (arg === '--web-security') {
    opts['web-security'] = args.shift() === 'true';
  } else if (arg === '--ignore-ssl-errors') {
    opts['ignore-ssl-errors'] = args.shift() === 'true';
  } else {
    console.error('Unsupported options: ' + arg);
    process.exit(1);
  }
}
if (args.length) {
  input = require('fs').createReadStream(args[0]);
}

phantomic(input, opts, function (code) {
  process.exit(code);
}).pipe(process.stdout);
