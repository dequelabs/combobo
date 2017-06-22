#!/usr/bin/env node
'use strict';

var driver  = require('../lib/driver');
var options = require('../lib/options');

driver(process.stdin, options(), function (err) {
  if (err) {
    process.nextTick(function () {
      process.exit(1);
    });
  }
}).pipe(process.stdout);
