'use strict';

const assert = require('chai').assert;
const Fixture = require('../fixture');
const queryAll = require('../../lib/utils/select').all;
const simpleSnippet = require('../snippets/simple.html');
const filters = require('../../lib/filters');

describe('lib/filter', () => {
  let fixture, opts;

  before(() => fixture = new Fixture());
  beforeEach(() => {
    fixture.create(`${simpleSnippet}`);
    opts = queryAll('.option', fixture.element);
  });
  afterEach(() => fixture.destroy());
  after(() => fixture.cleanUp());

  describe('contains', () => {
    it('should properly filter the options', () => {
      const filtered = filters.contains('een', opts);
      const texts = filtered.map((opt) => opt.innerText);
      assert.equal(filtered.length, 2);
      assert.deepEqual(texts, ['Ween', 'Greensky Bluegrass']);
    });
  });

  describe('equals', () => {
    it('should properly filter the options', () => {
      const filtered = filters.equals('Moe', opts);
      assert.equal(filtered.length, 0);
      const text = 'Moe.'
      const otherFiltered = filters.equals(text, opts);
      assert.equal(otherFiltered.length, 1);
      assert.equal(otherFiltered[0].innerText, text);
    });
  });

  describe('starts-with', () => {
    it('should properly filter the options', () => {
      const filtered = filters['starts-with']('le', opts);
      const texts = filtered.map((opt) => opt.innerText);
      assert.equal(filtered.length, 2);
      assert.deepEqual(texts, ['Leftover Salmon', 'Lettuce']);
    });
  });
});
