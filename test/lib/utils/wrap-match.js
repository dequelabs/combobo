'use strict';

const assert = require('chai').assert;
const wrapMatch = require('../../../lib/utils/wrap-match');

describe('lib/utils/wrap-match', () => {
  it('should properly wrap the match', () => {
    const opt = document.createElement('div');
    const input = document.createElement('input');
    input.value = 'oog';
    opt.innerHTML = 'boognish';
    const html = wrapMatch(opt, input, 'accent');

    assert.equal(html, 'b<span class="accent">oog</span>nish');
  });
});
