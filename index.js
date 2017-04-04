'use strict';

const Classlist = require('classlist');
const extend = require('extend-shallow');
const Emitter = require('component-emitter');
const LiveRegion = require('live-region');

const rndid = require('./lib/rndid');
const select = require('./lib/select');
const filters = require('./lib/filters');
const keyvent = require('./lib/keyvent');
const isWithin = require('./lib/is-within');
const elHandler = require('./lib/element-handler');
const defaults = {
  input: '.combobox',
  list: '.listbox',
  options: '.listbox .option',
  openClass: 'open',
  activeClass: null,
  useLiveRegion: true,
  filter: 'contains' // 'starts-with', 'equal', or funk
};

module.exports = class Combobox {
  constructor(config) {
    config = config || {};
    this.config = extend(defaults, config);
    this.input = elHandler(config.input || defaults.input);
    this.list = elHandler(config.list || defaults.list);
    this.cachedOpts = this.currentOpts = elHandler((config.options || defaults.options), true);
    this.isOpen = false;
    this.liveRegion = false;
    this.optIndex = null;

    this.initAttrs();
    this.initEvents();
  }

  initAttrs() {
    this.input.setAttribute('role', 'combobox');
    this.list.setAttribute('role', 'listbox');

    // ensure list has an id for the input's aria-owns attribute
    this.list.id = this.list.id || rndid();
    this.input.setAttribute('aria-owns', this.list.id);
    this.input.setAttribute('aria-autocomplete', 'list');
    this.input.setAttribute('aria-expanded', 'false');

    this.setOptionAttrs();

    if (this.config.useLiveRegion) {
      this.liveRegion = new LiveRegion();
    }
  }

  initEvents() {
    Emitter(this);

    this.input.addEventListener('click', () => {
      this.openList().goTo(this.optIndex || 0); // ensure its open
      this.emit('input:click');
    });

    this.input.addEventListener('blur', () => this.closeList());

    // listen for clicks outside of combobox
    document.addEventListener('click', (e) => {
      const target = e.target;
      const isOrWithin = isWithin(e.target, [this.input, this.list], true);
      if (!isOrWithin && this.isOpen) { this.closeList(); }
    });

    this.optionEvents();
    this.initKeys();
  }

  setOptionAttrs() {
    this.currentOpts.forEach((opt) => {
      opt.setAttribute('role', 'option');
      opt.id = opt.id || rndid();
    });
  }

  optionEvents() {
    this.currentOpts.forEach((option, i) => {
      option.addEventListener('click', () => {
        this.goTo(i).select();
      });

      option.addEventListener('mouseover', () => {
        // clean up
        const prev = this.currentOpts[this.optIndex];
        if (prev) { Classlist(prev).remove(this.config.activeClass); }
        Classlist(option).add(this.config.activeClass);
      });

      option.addEventListener('mouseout', () => {
        Classlist(option).remove(this.config.activeClass);
      });
    });
  }

  openList() {
    Classlist(this.list).add(this.config.openClass);
    this.isOpen = true;
    return this;
  }

  closeList() {
    Classlist(this.list).remove(this.config.openClass);
    this.isOpen = false;
    return this;
  }

  initKeys() {
    // keydown listener
    keyvent.down(this.input, [
      {
        keys: ['up', 'down'],
        callback: (e, k) => {
          if (this.isOpen) {
            return this.goTo(k === 'down' ? 'next' : 'prev');
          }
          this.openList().goTo(this.optIndex || 0);
        },
        preventDefault: true
      },
      {
        keys: ['enter'],
        callback: () => this.select()
      },
      {
        keys: ['escape'],
        callback: () => this.closeList()
      }
    ]);

    // filter keypress listener
    keyvent.up(this.input, (e) => {
      const filter = this.config.filter;
      if (e.which === 9 || !filter) { return; }
      this.openList();
      this.currentOpts = typeof filter === 'function' ?
        filter(this.input.value, this.cachedOpts) :
        filters[filter](this.input.value, this.cachedOpts);
      this.updateOpts()
    });
  }

  updateOpts() {
    this.cachedOpts.forEach((opt) => {
      opt.style.display = this.currentOpts.indexOf(opt) === -1 ? 'none' : 'block';
    });
  }

  select() {
    const value = this.currentOpts[this.optIndex].innerText;
    this.input.value = value;
    this.closeList();
  }

  goTo(option) {
    if (typeof option === 'string') { // 'prev' or 'next'
      return this.goTo(option === 'next' ? this.optIndex + 1 : this.optIndex - 1);
    }

    // NOTE: This prevents circularity
    if (!this.currentOpts[option]) { return; }
    // update current option index
    this.optIndex = option;
    // show pseudo focus styles
    this.pseudoFocus();
    return this;
  }

  pseudoFocus() {
    const option = this.currentOpts[this.optIndex];
    const activeClass = this.config.activeClass;
    const prevId = this.input.getAttribute('data-active-option');
    const prev = prevId && document.getElementById(prevId);

    // clean up
    if (prev && activeClass) {
      Classlist(prev).remove(activeClass);
    }

    if (option) {
      this.input.setAttribute('data-active-option', option.id);
      if (activeClass) { Classlist(option).add(activeClass); }

      if (this.liveRegion) {
        this.liveRegion.announce(this.currentOpts[this.optIndex].innerText);
      } else {
        this.input.setAttribute('aria-activedescendant', option.id);
      }
    }
  }
};
