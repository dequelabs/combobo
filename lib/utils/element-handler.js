'use strict';

const select = require('./select');

module.exports = (l, all, context) => {
  context = context || document;
  if (typeof l === 'string') {
    return all ? select.all(l, context) : select(l, context);
  }

  return l;
};
