/*
 * min-webdriver
 *
 * Copyright (c) 2014 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var http = require('http');

var contentType = 'application/json;charset=utf-8';


function indent(string) {
  return string.replace(/^/gm, '    ');
}

function fail(context, options, message, headers, body, callback) {
  context.out.write(options.method);
  context.out.write(' ');
  context.out.write(options.path);
  context.out.write('\n\n');
  context.out.write(message);
  if (headers) {
    context.out.write('\n');
    Object.keys(headers).forEach(function (header) {
      context.out.write('\n' + header + ': ' + headers[header]);
    });
    context.out.write('\n');
  }
  if (body) {
    context.out.write('\n');
    try {
      var parsed = JSON.parse(body);
      context.out.write('Response Status Code: ' + parsed.status
        + '\nResponse Message:\n');
      context.out.write(indent(parsed.value.message) + '\n');
    } catch (e) {
      context.out.write(indent(body.replace(/^\s+$/gm, '')));
    }
    context.out.write('\n');
  }
  context.out.write('\n');
  callback(new Error(message));
}

function request(context, method, path, json, callback) {
  var payload = json ? JSON.stringify(json) : null;
  var options = {
    hostname           : context.hostname,
    port               : context.port,
    path               : context.basePath + path,
    method             : method,
    headers            : {
      'Connection'     : 'keep-alive',
      'Accept'         : contentType,
      'Content-Type'   : contentType,
      'Content-Length' : payload ? Buffer.byteLength(payload) : 0
    }
  };

  var req = http.request(options, function (res) {

    var body = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      if ((res.statusCode === 302 || res.statusCode === 303)
          && path === '/session') {
        var sessionId = res.headers.location;
        if (!sessionId) {
          fail(context, options, 'Received HTTP status ' + res.statusCode
              + ' without location header', res.headers, body, callback);
          return;
        }
        sessionId = sessionId.substring(sessionId.lastIndexOf('/') + 1);
        callback(null, {
          sessionId : sessionId
        });
        return;
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        fail(context, options, 'Unexpected HTTP status: ' + res.statusCode
             + ' ' + http.STATUS_CODES[res.statusCode], res.headers, body,
             callback);
        return;
      }
      if (body) {
        var parsed;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          fail(context, options, 'Unexpected response:', null, body, callback);
          return;
        }
        if (parsed.status) {
          fail(context, options, 'Unexpected response status: ' +
               parsed.status, null, parsed.value.message, callback);
        } else {
          callback(null, parsed);
        }
      } else {
        callback(null);
      }
    });

  });

  req.on('error', function (e) {
    fail(context, options, 'Unexcected request error: ' + e.message, null,
         e.stack, callback);
  });

  if (payload) {
    req.write(payload);
  }
  req.end();
}

module.exports = request;
