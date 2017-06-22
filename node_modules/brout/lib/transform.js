/*
 * brout.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var through = require('through2');

module.exports = function () {
  return through.obj(function (row, env, next) {
    /*jslint unparam: true*/
    row = 'require("brout");' + row;
    this.push(row);
    next();
  });
};
