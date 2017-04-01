'use strict';

const Classlist = require('classlist');
const Emitter = require('component-emitter');
const elementHandler = require('./lib/element-handler');
const defaults = {
  input: '.combobox',
  list: '.listbox',
  options: '.listbox .options'
  openClass: 'open'
};

if (typeof module !== 'undefined') {
  module.exports = Combo;
}

class Combo {
  constructor(config) {
    this.input = elementHandler(config.input || defaults.input);
    this.list = elementHandler(config.list || defaults.list);
    this.options = elementHandler(config.options || defaults.options);
    this.openClass = config.openClass || defaults.openClass;

    this.initEvents();
  }

  initEvents() {
    Emitter(this);
    // attach DOM events
    this.input.addEventListener('click', () => {
      this.openList(); // ensure its open
      this.emit('input:click');
    });
    this.input.addEventListener('keydown', this.onInputKeydown.bind(this));
  }

  openList() {
    Classlist(this.list).add(this.openClass);
  }

  closeList() {
    Classlist(this.list).remove(this.openClass);
  }

  onInputKeydown(e) {
    const which = e.which;

    if (which === 40) {
      console.log('down pressed');
    }
  }
};
