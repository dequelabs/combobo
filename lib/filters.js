'use strict';

import val from './value';

module.exports = {
  'contains': (text, opts) => {
    return opts.filter((o) => {
      return val(o).toLowerCase().indexOf(text.toLowerCase()) > -1
    });
  },
  'equals': (text, opts) => {
    return opts.filter((o) => val(o).toLowerCase() === text.toLowerCase());
  },
  'starts-with': (text, opts) => {
    return opts.filter((o) => {
      return val(o).toLowerCase().indexOf(text.toLowerCase()) === 0;
    });
  }
};
