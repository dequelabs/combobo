'use strict';

var resolve = require('resolve');
var through = require('through2');
var minimatch = require('minimatch');
var combine = require('stream-combiner2');
var split = require('split2');
var _ = require('lodash');

function filterFiles(options, files) {
  var excludePattern = options.exclude ? [].concat(options.exclude) : [''];
  return function (file) {
    // If if doesnt match the pattern dont instrument it
    var matchResult = _.compact(_.map(excludePattern, function (pattern) {
      return minimatch(file, pattern);
    }));
    if (!matchResult.length) {
      files[file] = true;
    }
    return through();
  };
}

function instrument(options, files) {
  var Instrumenter = require(resolve.sync(options.instrumenter, {basedir: __dirname}));
  var instrumenter = new Instrumenter.Instrumenter();
  var captured = false;

  return through.obj(function(row, enc, next) {
    if (!files[row.file]) {
      this.push(row);
      next();
      return;
    }
    var self = this;
    instrumenter.instrument(row.source, row.file, function(err, code) {
      if (err) {
        self.emit('error', err);
        next();
        return;
      }
      row.source = code;
      // Inject __converage__ var
      if (!captured) {
        captured = true;
        row.source += 'after(function(){console.log("__coverage__=\'" + JSON.stringify(__coverage__) + "\';");});';
      }
      self.push(row);
      next();
    });
  });
}

var report = [];

function writeReports(options) {
  var Instrumenter = require(resolve.sync(options.instrumenter, {basedir: __dirname}));
  var collector = new Instrumenter.Collector();

  if (options.report) {
    report = options.report;
    delete options.report;
  }

  var data = '';
  var coverageRe = /__coverage__='([^;]*)';/gi;
  var skippedPreviousLine = false;
  var extractCoverage = through(function(buf, enc, next) {
    data += buf;
    if (!coverageRe.test(buf.toString())) {
      if (!skippedPreviousLine) this.push(buf);
      skippedPreviousLine = false;
    } else {
      skippedPreviousLine = true;
    }
    next();
  }, function(next) {
    var re = /__coverage__='([^;]*)';(\r\n?|\n)/gi;
    var match;
    // capture all the matches, there might be multiple
    while (match = re.exec(data)) {
      // match[1] contains JSON.stringify(__coverage__)
      collector.add(JSON.parse(match[1]));
    }

    // Add report
    [].concat(report).forEach(function (reportType) {
      Instrumenter.Report
        .create(reportType, _.clone(options))
        .writeReport(collector, true);
    });
    next();
  });
  return combine(split(/(\r?\n)/), extractCoverage);
}

module.exports = function (b, opts) {
  opts = _.extend({
    instrumenter: 'istanbul',
  }, opts);
  var reporterOptions = _.omit(opts, 'exclude');
  var files = {};

  function apply() {
    b.pipeline.get('pack').unshift(instrument(opts, files));
    b.pipeline.get('wrap').push(writeReports(reporterOptions));
  }

  b.transform(filterFiles(opts, files));
  b.on('reset', apply);
  apply();
};
