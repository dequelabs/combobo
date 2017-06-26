'use strict';

const assert = require('chai').assert;
const noResults = require('../../lib/no-results');

describe('lib/no-results', () => {
  describe('given noResultsText, no currentOpts and no no-results element', () => {
    it('should create the proper element and append it to the list', () => {
      const list = document.createElement('div');
      noResults(list, [], 'NOPE!');
      const nr = list.querySelector('.combobo-no-results');
      assert.isTrue(!!nr);
      assert.equal(nr.innerHTML, 'NOPE!');
    });
  });

  describe('given current options and an existing noResults element', () => {
    it('should remove the noResults element', () => {
      const list = document.createElement('div');
      const nrDiv = document.createElement('div');
      nrDiv.className = 'combobo-no-results';
      list.appendChild(nrDiv);
      noResults(list, [1, 2, 3]);
      assert.equal(0, list.childElementCount);
    });
  });
});
