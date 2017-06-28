'use strict';

const Classlist = require('classlist');

module.exports = (list, currentOpts, noResultsText) => {
  let noResults = list.querySelector('.combobo-no-results');

  if (noResultsText && !currentOpts.length && !noResults) {
    noResults = document.createElement('div');
    Classlist(noResults).add('combobo-no-results');
    noResults.innerHTML = noResultsText;
    list.appendChild(noResults);
  } else if (noResults && currentOpts.length) {
    list.removeChild(noResults);
  }
};
