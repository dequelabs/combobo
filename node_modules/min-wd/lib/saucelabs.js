'use strict';

var SauceLabs = require('saucelabs');

exports.updateJob = function (sessionId, options, callback) {
  var sauceClient = new SauceLabs({
    username: process.env.SAUCE_USERNAME,
    password: process.env.SAUCE_ACCESS_KEY
  });
  sauceClient.updateJob(sessionId, options, callback);
};
