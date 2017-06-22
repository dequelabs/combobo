/*
 * min-webdriver
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var through   = require('through2');
var listen    = require('listen');
var sourceMap = require('source-mapper');
var request   = require('./request');
var sauceLabs = require('./saucelabs');


function close(context, callback) {
  request(context, 'DELETE', "/window", null, function () {
    request(context, 'DELETE', '', null, function () {
      callback();
    });
  });
}

function handleError(context, err, callback) {
  if (context.closeOnError) {
    close(context, function () {
      callback(err);
    });
  } else {
    callback(err);
  }
}

function pollLogs(context, callback) {
  var endpoint = context.asyncPolling ? '/execute_async' : '/execute';
  var timeout = context.asyncPolling ? 0 : context.pollingInterval;
  var script;
  if (context.asyncPolling) {
    script = 'window._webdriver_poll(arguments[0]);';
  } else {
    script = 'return window._webdriver_manualPoll();';
  }
  request(context, 'POST', endpoint, {
    script : script,
    args   : []
  }, function (err, res) {
    if (err) {
      handleError(context, err, callback);
      return;
    }
    var match = res.value.match(/^WEBDRIVER_EXIT\(([0-9]+)\)$/m);
    if (match) {
      context.out.write(res.value.substring(0, match.index));

      var localCallback = function () {
        var passed = match[1] === '0';

        function done() {
          if (passed) {
            callback();
          } else {
            callback(new Error('Build failed: ' + match[1]));
          }
        }

        if (context.sauceLabs) {
          sauceLabs.updateJob(res.sessionId, {
            name   : context.sauceJobName,
            passed : passed,
            build  : process.env[context.BUILD_VAR]
          }, done);
        } else {
          done();
        }
      };

      if (context.closeOnSuccess) {
        close(context, localCallback);
      } else {
        localCallback();
      }
      return;
    }
    if (context.out.write(res.value)) {
      setTimeout(function () {
        pollLogs(context, callback);
      }, timeout);
    } else {
      context.out.once('drain', function () {
        setTimeout(function () {
          pollLogs(context, callback);
        }, timeout);
      });
    }
  });
}

/*
 * This hack works around the following issues:
 *
 * https://github.com/mantoni/mochify.js/issues/110
 * https://bugs.chromium.org/p/chromedriver/issues/detail?id=402
 * https://github.com/sinonjs/sinon/issues/912
 *
 * Apparently the Chrome webdriver has a buffer limit somewhere around 1 MB.
 * Injecting scripts that are below a certain size works reliably, so we have
 * to slice the actual script into chunks, merge the parts in the browser and
 * then inject a script tag there.
 */
var MAX_SCRIPT_CHUNK = 700 * 1000;
function streamChunk(context, script, callback) {
  var execute = false;
  var nextScript = '';
  if (script.length > MAX_SCRIPT_CHUNK) {
    nextScript = script.substring(MAX_SCRIPT_CHUNK);
    script = script.substring(0, MAX_SCRIPT_CHUNK);
  } else {
    execute = true;
  }
  request(context, 'POST', '/execute', {
    script: 'window._webdriver_receive(arguments[0], arguments[1])',
    args: [script, execute]
  }, function (err) {
    if (err) {
      handleError(context, err, callback);
    } else if (nextScript) {
      streamChunk(context, nextScript, callback);
    } else {
      setTimeout(function () {
        pollLogs(context, callback);
      }, 10);
    }
  });
}

function execute(context, script, callback) {
  request(context, 'POST', '/execute', {
    script: 'var script = "";'
      + 'window._webdriver_receive = function (chunk, execute) {'
      + 'script += chunk;'
      + 'if (execute) {'
      + '  var s = document.createElement("script");'
      + '  s.textContent = script;'
      + '  document.body.appendChild(s);'
      + '}};',
    args: []
  }, function (err) {
    if (err) {
      handleError(context, err, callback);
    } else {
      streamChunk(context, script, callback);
    }
  });
}

function openUrl(context, script, callback) {
  var browser = context.browser;
  var title   = browser.name + ' ' + (browser.version || '*');
  context.out.write('# ' + title + ':\n');

  var x = sourceMap.extract(script);
  if (x.map) {
    var sm = sourceMap.stream(x.map);
    sm.pipe(context.out);
    context.out = sm;
  }

  var url = browser.url || context.url;
  if (url) {
    request(context, 'POST', '/url', {
      url : url
    }, function (err) {
      if (err) {
        handleError(context, err, callback);
        return;
      }
      execute(context, x.js, callback);
    });
  } else {
    execute(context, x.js, callback);
  }
}

function connectBrowser(context, callback) {
  var caps = {
    browserName       : context.browser.name,
    version           : context.browser.version,
    platform          : context.browser.platform,
    javascriptEnabled : true
  };
  if (context.sauceLabs) {
    caps.username  = process.env.SAUCE_USERNAME;
    caps.accessKey = process.env.SAUCE_ACCESS_KEY;
  }
  var json = {
    desiredCapabilities : caps
  };

  request(context, 'POST', '/session', json, function (err, res) {
    if (err) {
      callback(err);
      return;
    }
    context.basePath = context.basePath + '/session/' + res.sessionId;
    if (!context.asyncPolling || context.timeout === 0) {
      callback(null);
      return;
    }
    request(context, 'POST', '/timeouts/async_script', {
      ms : context.timeout || 10000
    }, function (err) {
      if (err) {
        handleError(context, err, callback);
      } else {
        callback(null);
      }
    });
  });
}

function createContext(options, browser, out) {
  return {
    hostname      : options.hostname,
    port          : options.port,
    url           : options.url,
    asyncPolling  : options.asyncPolling,
    pollingInterval : options.pollingInterval,
    timeout       : options.timeout,
    basePath      : '/wd/hub',
    browser       : browser,
    BUILD_VAR     : options.BUILD_VAR,
    sauceJobName  : options.sauceJobName,
    out           : out,
    sauceLabs     : options.sauceLabs,
    closeOnError  : options.closeOnError,
    closeOnSuccess : options.closeOnSuccess
  };
}

function pipe(streams, out) {
  if (!streams.length) {
    out.end();
    return;
  }
  var stream = streams.shift();
  stream.on('data', function (data) {
    out.write(data);
  });
  stream.on('end', function () {
    pipe(streams, out);
  });
  stream.resume();
}

function run(options, out, runner, callback) {
  var listener = listen();
  var streams  = options.browsers.map(function (browser) {
    var stream = through();
    stream.pause();
    var cb = listener(function () {
      stream.end();
    });
    var context = createContext(options, browser, stream);
    connectBrowser(context, function (err) {
      if (err) {
        cb(err);
        return;
      }
      runner(context, cb);
    });
    return stream;
  });
  pipe(streams, out);
  listener.then(callback);
}

function createRunner(input) {
  var requests = [];
  var script   = '';
  input.on('data', function (chunk) {
    script += chunk;
  });
  input.on('end', function () {
    if (!script) {
      requests.forEach(function (request) {
        close(request.context, request.callback);
      });
    } else {
      requests.forEach(function (request) {
        openUrl(request.context, script, request.callback);
      });
    }
    requests = null;
  });

  return function (context, callback) {
    if (requests) {
      requests.push({ context : context, callback : callback });
    } else {
      if (!script) {
        close(context, callback);
        return;
      }
      openUrl(context, script, callback);
    }
  };
}


module.exports = function (input, options, callback) {
  var error;
  var out = through(function (chunk, enc, next) {
    /*jslint unparam: true*/
    this.push(chunk);
    next();
  }, function (next) {
    next();
    callback(error);
  });

  run(options, out, createRunner(input), function (err) {
    error = err;
  });

  return out;
};
