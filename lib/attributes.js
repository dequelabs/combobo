'use strict';

import rndid from './utils/rndid';

/**
 * Sets attributes on input / list / options
 */
module.exports = (input, list, options) => {
  list.id = list.id || rndid();

  input.setAttribute('role', 'combobox');
  list.setAttribute('role', 'listbox');
  input.setAttribute('aria-controls', list.id);
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');

  options.forEach((opt) => {
    opt.setAttribute('role', 'option');
    opt.id = opt.id || rndid();
  });
};
