'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var mochify = require('mochify');
var assert = require('assert');
var through = require('through2');
var rimraf = require('rimraf');
var istanbul = require('../');

var phantomjsPath = path.resolve('node_modules/.bin/phantomjs');
var defaultOutputJSON = path.resolve('./coverage-final.json');
var defaultOutputXML = path.resolve('./cobertura-coverage.xml');

var out;
var output;

function validateOutput(validator) {
  return function (err) {
    var report;

    if (err) return validator(err);

    // Forces reload of the json file
    delete(require.cache[defaultOutputJSON]);

    assert.doesNotThrow(function () {
      report = require(defaultOutputJSON);
    }, 'coverage file not found or invalid');

    assert.ok(fs.existsSync(defaultOutputXML), 'cobertura file not found');
    if (validator) validator(report);
  };
}

function duplicate(b) {
  var data = '';
  b.pipeline.get('wrap').push(through(function (buf, enc, next) {
    data += buf;
    next();
  }, function (next) {
    this.push(data);
    this.push(data);
    data = '';
    next();
  }));
}

function createTestInstance(testFile, opts) {
  // For debugging
  // var debugOutput = require('fs').createWriteStream('./tmp.txt');

  var m = mochify(testFile, {
    output: output,
    // output: debugOutput, // for debugging
    reporter: 'tap'
  });
  if (opts.duplicate) {
    m = m.plugin(duplicate);
  }
  return m.plugin(istanbul, opts);
}

function resetOutput() {
  out = '';
  output = through(function (chunk, enc, next) {
    out += chunk;
    next();
  });
}

describe('Basic', function () {
  this.timeout(5000);

  beforeEach(function () {
    resetOutput();
    rimraf.sync(defaultOutputJSON);
    rimraf.sync(defaultOutputXML);
  });

  it('should instrument the code and run report', function (done) {
    createTestInstance('./test/fixtures/pass-100.js', {
      report: ['json', 'cobertura']
    }).bundle(validateOutput(function (report) {
      var keys = Object.keys(report);

      assert.equal(keys.length, 1, 'more than one file instrumented');
      assert.equal(path.basename(keys[0]), 'pass-100.js', 'wrong file instrumented');
      done();
    }));
  });

  it('should instrument multiple files and only expose coverage once', function (done) {
    createTestInstance('./test/fixtures/pass-50.js ./test/fixtures/pass-100.js', {
      report: ['json', 'cobertura']
    }).bundle(validateOutput(function (report) {
      var keys = Object.keys(report);

      assert.equal(keys.length, 2, 'more than one file instrumented');
      assert.equal(path.basename(keys[0]), 'pass-50.js', 'wrong file instrumented');
      assert.equal(path.basename(keys[1]), 'pass-100.js', 'wrong file instrumented');
      assert.equal(JSON.stringify(report[keys[0]].s), '{"1":1,"2":1,"3":1,"4":0}', 'not 50% coverage');
      assert.equal(JSON.stringify(report[keys[1]].s), '{"1":1,"2":1,"3":1}', 'not 100% coverage');
      done();
    }));
  });

  it('should collect multiple coverage statistics', function (done) {
    createTestInstance('./test/fixtures/pass-50.js ./test/fixtures/pass-100.js', {
      report: ['json', 'cobertura'],
      duplicate: true
    }).bundle(validateOutput(function (report) {
      var keys = Object.keys(report);

      assert.equal(keys.length, 2, 'more than one file instrumented');
      assert.equal(path.basename(keys[0]), 'pass-50.js', 'wrong file instrumented');
      assert.equal(path.basename(keys[1]), 'pass-100.js', 'wrong file instrumented');
      assert.equal(JSON.stringify(report[keys[0]].s), '{"1":2,"2":2,"3":2,"4":0}', 'not 50% coverage');
      assert.equal(JSON.stringify(report[keys[1]].s), '{"1":2,"2":2,"3":2}', 'not 100% coverage');
      done();
    }));
  });

  it('should report 50% coverage', function (done) {
    createTestInstance('./test/fixtures/pass-50.js', {
      report: ['json', 'cobertura']
    }).bundle(validateOutput(function (report) {
      var expectedResult = require('./fixtures/coverage-pass-50.json');
      var keys = Object.keys(report);

      assert.equal(keys.length, 1, 'more than one file instrumented');
      assert.equal(path.basename(keys[0]), 'pass-50.js', 'wrong file instrumented');

      assert.deepEqual(report[keys[0]].s, expectedResult.s, 'statement reported count dont match');
      assert.deepEqual(report[keys[0]].b, expectedResult.b, 'branch reported count dont match');
      assert.deepEqual(report[keys[0]].f, expectedResult.f, 'function reported count dont match');
      done();
    }));
  });

  it('should not fail if test fails', function (done) {
    createTestInstance('./test/fixtures/fail-50.js', {
      report: ['json', 'cobertura']
    }).bundle(validateOutput(function (report) {
      var keys = Object.keys(report);

      assert.equal(keys.length, 1, 'more than one file instrumented');
      assert.equal(path.basename(keys[0]), 'fail-50.js', 'wrong file instrumented');
      done();
    }));
  });

  it('should not modify the output of mochify', function (done) {
    var testFile = './test/fixtures/pass-100.js';
    var firstOut;

    createTestInstance(testFile, {
      report: ['json']
    })
    .bundle(function () {
      // save first output, reset the stream and compare
      firstOut = out;
      resetOutput();

      mochify(testFile, {
        output: output,
        reporter: 'tap'
      }).bundle(function () {
        assert.deepEqual(firstOut, out);
        done();
      });
    });
  });

  it('should not instrument the exclude the pattern', function (done) {
    createTestInstance('./test/fixtures/pass-ignore-case.js', {
      exclude: '**/ignored*.js',
      report: ['json', 'cobertura']
    }).bundle(validateOutput(function (report) {
      var keys = Object.keys(report);

      assert.equal(keys.length, 1, 'more than one file instrumented');
      assert.equal(path.basename(keys[0]), 'pass-ignore-case.js', 'wrong file instrumented');
      done();
    }));
  });

  it('should not instrument the exclude the patterns', function (done) {
    createTestInstance('./test/fixtures/pass-ignore-case.js', {
      exclude: ['**/ignored.js', '**/ignored2.js'],
      report: ['json', 'cobertura']
    }).bundle(validateOutput(function (report) {
      var keys = Object.keys(report);

      assert.equal(keys.length, 1, 'more than one file instrumented');
      assert.equal(path.basename(keys[0]), 'pass-ignore-case.js', 'wrong file instrumented');
      done();
    }));
  });

  it('should not fail if no instrumented files', function (done) {
    createTestInstance('./test/fixtures/pass-ignore-case.js', {
      exclude: '**/*',
      report: ['json', 'cobertura']
    }).bundle(validateOutput(function (report) {
      assert.deepEqual(report, {}, 'some files were instrumented');
      done();
    }));
  });

  it.skip('should support other instrumenters that support ES6', function (done) {
    createTestInstance('./test/fixtures/es6.js', {
      instrumenter: 'babel-istanbul',
      report: ['json', 'cobertura']
    }).bundle(validateOutput(function (report) {
      var keys = Object.keys(report);

      assert.equal(keys.length, 1, 'more than one file instrumented');
      assert.equal(path.basename(keys[0]), 'es6.js', 'wrong file instrumented');
      done();
    }))
  });

  it('should work with babelify', function (done) {
    this.timeout(10000); // prevent timeout on travis
    var m = createTestInstance('./test/fixtures/es6.js', {
      report: ['json', 'cobertura']
    });
    m.transform('babelify', { presets: ["es2015"] });
    m.bundle(validateOutput(function (report) {
      var keys = Object.keys(report);

      assert.equal(keys.length, 1, 'more than one file instrumented');
      assert.equal(path.basename(keys[0]), 'es6.js', 'wrong file instrumented');
      done();
    }))
  });

  it('should allow to include files in node_modules folders', function (done) {
    var m = createTestInstance('./test/fixtures/node_modules/dep.js', {
      report: ['json', 'cobertura']
    });
    m.bundle(validateOutput(function (report) {
      var keys = Object.keys(report);

      assert.equal(keys.length, 1, 'more than one file instrumented');
      assert.equal(path.basename(keys[0]), 'dep.js', 'wrong file instrumented');
      done();
    }))
  });

  it('should print full test reports when run from the command line', function (done) {
    var testFile = './test/fixtures/fail-50.js';
    var reporter = 'tap'
    var firstOut;

    createTestInstance(testFile, {
      report: ['json']
    })
    .bundle(function () {
      // save first output, reset the stream and compare
      firstOut = out;
      resetOutput();

      exec('./node_modules/.bin/mochify --reporter=tap --plugin [ . ] ' + testFile, function(err, result) {
        assert.deepEqual(firstOut, result, 'cli did not print full test report');
        done();
      });
    });
  });
});
