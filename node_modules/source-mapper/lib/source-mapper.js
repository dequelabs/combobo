/*
 * source-mapper.js
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var through   = require('through2');
var convert   = require('convert-source-map');
var sourceMap = require('source-map');



exports.extract = function (js) {
  var map = convert.fromSource(js);
  if (map) {
    map = map.toObject();
    delete map.sourcesContent;
    js = convert.removeComments(js);
  }
  return {
    js  : js,
    map : map
  };
};


exports.consumer = function (map) {
  return new sourceMap.SourceMapConsumer(map);
};


exports.line = function (consumer, line, offset) {
  return line.split('\n').map(function (line) {
    var stackRE = new RegExp('([a-z0-9]+\\.html|\\[stdin\\]|about:blank|'
      + 'http:\\/\\/[a-z0-9\\-_\\.]+(:[0-9]+)?\\/[^:]+|'
      + 'file:[^:]+|Unknown script code|<anonymous>)'
      + ':(\\d+)(:\\d+)?(\\D*)$', 'i');
    var match = stackRE.exec(line);
    if (!match) {
      return line;
    }
    var n = Number(match[3]) - (offset || 0);
    if (n < 1) {
      return line;
    }
    var mapped = consumer.originalPositionFor({
      line   : n,
      column : Number(match[4] ? match[4].substring(1) : 0)
    });
    var pre = line.substring(0, match.index)
      .replace(/^\s+/, '')
      .replace('@', ' ');
    return '      ' + pre + mapped.source + ':' + mapped.line + match[5];
  }).join('\n');
};


exports.stream = function (consumer, offset) {
  if (!(consumer instanceof sourceMap.SourceMapConsumer)) {
    consumer = new sourceMap.SourceMapConsumer(consumer);
  }
  var buf = '';
  return through(function (chunk, enc, next) {
    /*jslint unparam: true*/
    buf += chunk.toString();
    var p = buf.lastIndexOf('\n');
    if (p !== -1) {
      this.push(exports.line(consumer, buf.substring(0, p + 1), offset));
      buf = buf.substring(p + 1);
    }
    if (buf.length > 3 && !/^\s+at /.test(buf)) {
      this.push(buf);
      buf = '';
    }
    next();
  }, function (next) {
    if (buf) {
      this.push(buf);
    }
    next();
  });
};
