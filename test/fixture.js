'use strict';

const queryAll = require('../lib/utils/select').all;

module.exports = class Fixture {
  constructor() {}

  /**
   * Creates a fixture element with provided markup
   * @param  {String} markup A string of html to be added to the fixture
   */

  create(markup) {
    markup = markup || '';
    this.element = document.createElement('div');
    this.element.id = 'fixture';
    this.element.innerHTML = markup;

    document.body.appendChild(this.element);
    return this;
  }

  /**
   * Removes the fixture from the DOM
   */

  destroy() {
    if (this.element) {
      document.body.removeChild(this.element);
    }

    return this;
  }

  /**
   * Removes the assets from the DOM
   */

  cleanUp() {
    queryAll('[aria-live="assertive"]').forEach((el) => el.parentNode.removeChild(el));
    return this;
  }
};
