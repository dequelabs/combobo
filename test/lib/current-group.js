'use strict';

const assert = require('chai').assert;
const currentGroup = require('../../lib/current-group');

describe('lib/current-group', () => {
  it('should be a function', () => {
    assert.equal(typeof currentGroup, 'function');
  });

  it('should return the proper group', () => {
    const g = document.createElement('div');
    const opt = document.createElement('div');
    g.appendChild(opt);
    const groups = [
      { options: [document.createElement('div')] },
      { element: g, options: [opt] }
    ];
    const current = currentGroup(groups, opt);
    assert.equal(current.element, g);
    assert.equal(current.options.length, 1);
    assert.equal(current.options[0], opt);
  });
});
