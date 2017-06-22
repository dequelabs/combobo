'use strict';

var stream    = require('stream');
var sourceMap = require('source-mapper');
var spawn     = require('cross-spawn');
var exec      = require('child_process').exec;
var http      = require('http');
var fs        = require('fs');

var inspector = 'http://localhost:9000/webkit/inspector/inspector.html?page=2';


function httpServer(port, js, callback) {
  var server = http.createServer(function (req, res) {
    var url = req.url;
    var p = url.indexOf('?');
    if (p !== -1) {
      url = url.substring(0, p);
    }
    if (url === '/') {
      res.writeHead(200);
      fs.createReadStream(__dirname + '/page.html').pipe(res);
    } else if (url === '/js/bundle') {
      res.writeHead(200);
      js.pipe(res);
      js.resume();
    } else if (url === '/js/es5-shim') {
      res.writeHead(200);
      fs.createReadStream(require.resolve('es5-shim/es5-shim')).pipe(res);
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  server.timeout = 0;
  server.listen(port || 0, function (err) {
    callback(err, server);
  });
}

function launchPhantom(output, options, callback) {
  var args = [__dirname + '/runner.js'];
  if (options.debug) {
    args.unshift('--remote-debugger-autorun=yes');
    args.unshift('--remote-debugger-port=9000');
  }
  if (typeof options['web-security'] === 'boolean') {
    args.unshift('--web-security=' + options['web-security']);
  }
  if (typeof options['ignore-ssl-errors'] === 'boolean') {
    args.unshift('--ignore-ssl-errors=' + options['ignore-ssl-errors']);
  }
  var exitCode;
  var ended = 0;
  var onEnd = function () {
    if (++ended === 3) {
      output.end(function () {
        setTimeout(function () {
          callback(exitCode);
        });
      });
    }
  };
  var env = {
    PATH: process.env.PATH,
    PHANTOMIC_PORT: options.port,
    PHANTOMIC_DEBUG: options.debug ? '1' : '',
    PHANTOMIC_BROUT: options.brout ? '1' : '',
    PHANTOMIC_VIEWPORTHEIGHT: options['viewport-height'] || '',
    PHANTOMIC_VIEWPORTWIDTH: options['viewport-width'] || ''
  };
  if (process.env.TZ) env.TZ = process.env.TZ;
  var phantomjs = spawn(options.phantomjs || 'phantomjs', args, {
    env: env
  });
  phantomjs.stdout.pipe(output, { end: false });
  phantomjs.stderr.on('data', function (data) {
    if (data.toString() === 'PHANTOMIC_DEBUG') {
      var cmd;
      if (process.platform === 'darwin') {
        cmd = 'open';
      } else if (process.platform === 'win32') {
        cmd = 'start ""';
      }
      if (cmd) {
        exec(cmd + ' ' + inspector);
      } else {
        process.stderr.write('\nPlease open ' + inspector + '\n');
      }
    } else {
      output.write(data);
    }
  });
  phantomjs.stdout.on('end', onEnd);
  phantomjs.stderr.on('end', onEnd);
  phantomjs.on('error', function (err) {
    if (err.code === 'ENOENT') {
      console.log('Cannot find phantomjs. Make sure it\'s in your $PATH, '
        + 'or specify with --phantomjs.');
    } else {
      console.log('phantomjs failed:', err.toString());
    }
    ended = 2;
    exitCode = 1;
    onEnd();
  });
  phantomjs.on('exit', function (code) {
    exitCode = code;
    onEnd();
  });
}


module.exports = function (input, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var output = new stream.PassThrough();
  var phantomOutput = new stream.PassThrough();
  var jsStream = new stream.PassThrough();
  jsStream.pause();
  var js = '';
  input.on('data', function (d) {
    js += d;
  });
  input.on('end', function () {
    var x = sourceMap.extract(js);
    if (x.map) {
      var sm = sourceMap.stream(x.map);
      phantomOutput.pipe(sm).pipe(output, { end: false });
    } else {
      phantomOutput.pipe(output, { end: false });
    }
    jsStream.end(x.js);
  });
  httpServer(options.port, jsStream, function (err, server) {
    if (err) {
      process.stderr.write('Server failed: ' + err.toString() + '\n');
      callback(1);
    } else {
      options.port = server.address().port;
      launchPhantom(phantomOutput, options, function (code) {
        server.close();
        callback(code);
      });
    }
  });
  return output;
};
