'use strict';

module.exports = (selector, context) => {
  context = context || document;
  return context.querySelector(selector);
};

exports.all = (selector, context) => {
  context = context || document;
  return Array.prototype.slice.call(
    context.querySelectorAll(selector)
  );
};
