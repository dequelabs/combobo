'use strict';

const select = require('./select');

module.exports = (l, all) => {
  if (typeof l === 'string') {
    return all ? select.all(l) : select(all);
  }
  
  return l;
};
