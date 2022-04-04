'use strict';

const assert = require('chai').assert;
const attrs = require('../../lib/attributes');

describe('lib/attributes', () => {
  it('should be a function', () => {
    assert.equal(typeof attrs, 'function');
  });

  it('should add the right attributes', () => {
    const input = document.createElement('input');
    const list = document.createElement('ul');
    const options = [document.createElement('div')];

    attrs(input, list, options);

    assert.isTrue(!!list.id);
    assert.equal(input.getAttribute('role'), 'combobox');
    assert.equal(list.getAttribute('role'), 'listbox');
    assert.equal(input.getAttribute('aria-controls'), list.id);
    assert.equal(input.getAttribute('aria-autocomplete'), 'list');
    assert.equal(input.getAttribute('aria-expanded'), 'false');

    options.forEach((opt) => {
      assert.equal(opt.getAttribute('role'), 'option');
      assert.isTrue(!!opt.id);
    });
  });
});
