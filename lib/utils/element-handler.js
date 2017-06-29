'use strict';

import select from './select';

module.exports = (l, all, context) => {
  context = context || document;
  if (typeof l === 'string') {
    return all ? select.all(l, context) : select(l, context);
  }

  return l;
};
