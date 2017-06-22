/*
 * min-webdriver
 *
 * Copyright (c) 2014-2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var path    = require('path');
var through = require('through2');
var resolve = require('resolve');
var driver  = require('../lib/driver');
var options = require('../lib/options');


function relative(file) {
  return './' + path.relative(process.cwd(), file).replace(/\\/g, '/');
}

module.exports = function (b, opts) {

  var clientFile = path.join(__dirname, 'client.js');
  b.add(relative(clientFile), {
    expose : 'min-wd'
  });

  var done;
  var stream = through();
  var wrap = b.pipeline.get('wrap');
  wrap.push(through(function (chunk, enc, next) {
    /*jslint unparam: true*/
    stream.push(chunk);
    next();
  }, function (next) {
    done = next;
    stream.push(null);
  }));
  wrap.push(driver(stream, options(opts || {}), function (err) {
    if (err) {
      b.emit('error', err);
    }
    if (done) {
      done();
    }
  }));

};
