'use strict';

const assert = require('chai').assert;
const value = require('../../lib/value');

describe('lib/value', () => {
  it('should support data-value attribute (as the 1st priority)', () => {
    const div = document.createElement('div');
    div.setAttribute('data-value', 'cats');
    div.innerHTML = 'dogs';
    assert.equal(value(div), 'cats');
  });

  it('should support innerText (as the 2nd priority)', () => {
    const div = document.createElement('div');
    div.innerHTML = 'dogs';
    assert.equal(value(div), 'dogs');
  });
});
