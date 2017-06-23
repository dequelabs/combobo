'use strict';

/**
 * The default config for Combobo
 * @type {Object}
 */
module.exports = {
  input: '.combobox',
  list: '.listbox',
  options: '.option', // qualified within `list`
  groups: null, // qualified within `list`
  openClass: 'open',
  activeClass: 'active',
  selectedClass: 'selected',
  useLiveRegion: true,
  multiselect: false,
  noResultsText: null,
  selectionValue: (selecteds) => selecteds.map((s) => s.innerText.trim()).join(' - '),
  optionValue: (option) => option.innerHTML,
  announcement: {
    count: (n) => `${n} options available`,
    selected: 'Selected'
  },
  filter: 'contains' // 'starts-with', 'equals', or funk
};
