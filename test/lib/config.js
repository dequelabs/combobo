'use strict';

const assert = require('chai').assert;
const config = require('../../lib/config');

describe('lib/config', () => {
  it('should be a function', () => {
    assert.equal(typeof config, 'function');
  });

  it('should properly merge the userConfig with the defaults', () => {
    const configuration = config({
      announcement: {
        count: 7
      },
      multiselect: true,
      input: 'blahblah',
      noResultsText: 7
    });

    assert.equal(configuration.input, 'blahblah');
    assert.equal(configuration.list, '.listbox');
    assert.equal(configuration.options, '.option');
    assert.equal(configuration.groups, null);
    assert.equal(configuration.openClass, 'open');
    assert.equal(configuration.activeClass, 'active');
    assert.equal(configuration.announcement.count, 7);
    assert.equal(configuration.announcement.selected, 'Selected.');
    assert.equal(configuration.noResultsText, 7);
    assert.equal(configuration.autoFilter,true);
  });
});
