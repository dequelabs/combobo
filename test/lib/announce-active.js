'use strict';

const assert = require('chai').assert;
const aa = require('../../lib/announce-active');
const Fixture = require('../fixture');
const simpleSnippet = require('../snippets/simple.html');
const Combobo = require('../../index');

describe('lib/announce-active', () => {
  let fixture, simpleBox;

  before(() => fixture = new Fixture());
  beforeEach(() => {
    fixture.create(`${simpleSnippet}`);
    simpleBox = new Combobo({
      input: '#combobox-single',
      list: '#simple-listbox'
    });
  });
  afterEach(() => fixture.destroy());
  after(() => fixture.cleanUp());

  it('should be a function', () => {
    assert.equal('function', typeof aa);
  });

  describe('given a falsey groupChanged', () => {
    it('should invoke announce with the proper arguments', () => {
      let msg, time;
      const opt = simpleBox.cachedOpts[0];
      const text = opt.innerText;
      aa(simpleBox.cachedOpts[0], simpleBox.config, (text, m) => {
        msg = text;
        time = m;
      }, false);

      assert.equal(msg, text);
      assert.equal(time, 500);
    });
  })

  describe('given a truthy groupChanged, config announcement groupChange', () => {
    it('should properly prepend the groupChange text to the announcement', () => {
      let msg;
      const opt = simpleBox.cachedOpts[0];
      const text = opt.innerText;
      const groupChangeText = 'group change';
      aa(simpleBox.cachedOpts[0], {
        announcement: {
          selected: '',
          groupChange: () => groupChangeText
        }
      }, (text) => {
        msg = text;
      }, true);

      assert.equal(msg, `${groupChangeText} ${text}`);
    });
  });

  describe('given a truthy selected', () => {
    it('should append the proper selected text to the message', () => {
      let msg;
      const opt = simpleBox.cachedOpts[0];
      const text = opt.innerText;
      const selectedText = 'foo';

      opt.setAttribute('aria-selected', 'true');

      aa(simpleBox.cachedOpts[0], {
        announcement: { selected: selectedText }
      }, (text) => {
        msg = text;
      }, false);

      assert.equal(msg, `${text} ${selectedText}`);
    });
  });
});
