'use strict';

/**
 * NOTE:
 * - https://www.w3.org/TR/2016/WD-wai-aria-practices-1.1-20160317/#combobox
 *    - "For each combobox pattern the button need not be in the tab order if there
 *    is an appropriate keystroke associated with the input element such that when
 *    focus is on the input, the keystroke triggers display of the associated drop
 *    down list."
 */

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
  announcement: (n) => `${n} options available`,
  filter: 'contains' // 'starts-with', 'equals', or funk
};

module.exports = class Combobox {
  constructor(config) {
    config = config || {};

    // merge user config with default config
    this.config = extend(defaults, config);
    this.input = elHandler(this.config.input);
    this.list = elHandler(this.config.list);
    this.cachedOpts = this.currentOpts = elHandler((this.config.options), true);

    // initial state
    this.isOpen = false;
    this.liveRegion = null;
    this.currentOption = null;
    this.isHovering = false;

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
      this.liveRegion = new LiveRegion({ ariaLive: 'assertive' });
    }
  }

  initEvents() {
    Emitter(this);

    this.input.addEventListener('click', () => {
      this.openList().goTo(this.getOptIndex() || 0); // ensure its open
    });

    this.input.addEventListener('blur', () => {
      if (!this.isHovering) { this.closeList(); }
    });

    // listen for clicks outside of combobox
    document.addEventListener('click', (e) => {
      const target = e.target;
      const isOrWithin = isWithin(e.target, [this.input, this.list], true);
      if (!isOrWithin && this.isOpen) { this.closeList(); }
    });

    this.optionEvents();
    this.initKeys();
  }

  getOptIndex() {
    return this.currentOption && this.currentOpts.indexOf(this.currentOption);
  }

  setOptionAttrs() {
    this.currentOpts.forEach((opt) => {
      opt.setAttribute('role', 'option');
      opt.id = opt.id || rndid();
    });
  }

  optionEvents() {
    this.cachedOpts.forEach((option) => {
      option.addEventListener('click', () => {
        this
          .goTo(this.currentOpts.indexOf(option))
          .select();
      });

      option.addEventListener('mouseover', () => {
        // clean up
        const prev = this.currentOption;
        if (prev) { Classlist(prev).remove(this.config.activeClass); }
        Classlist(option).add(this.config.activeClass);
        this.isHovering = true;
      });

      option.addEventListener('mouseout', () => {
        Classlist(option).remove(this.config.activeClass);
        this.isHovering = false;
      });
    });
  }

  openList() {
    Classlist(this.list).add(this.config.openClass);
    this.input.setAttribute('aria-expanded', 'true');
    if (!this.isOpen) {
      // announcing count
      this.announceCount();
    }
    this.isOpen = true;
    this.emit('list:open');
    return this;
  }

  closeList(focus) {
    Classlist(this.list).remove(this.config.openClass);
    this.input.setAttribute('aria-expanded', 'false');
    this.isOpen = false;
    if (focus) { this.input.focus(); }
    this.emit('list:close');
    return this;
  }

  initKeys() {
    // keydown listener
    keyvent.down(this.input, [{
      keys: ['up', 'down'],
      callback: (e, k) => {
        if (this.isOpen) {
          // if typing filtered out the pseudo-current option
          if (this.currentOpts.indexOf(this.currentOption) === -1) { return this.goTo(0); }
          return this.goTo(k === 'down' ? 'next' : 'prev');
        }

        this.goTo(this.currentOption ? this.getOptIndex() : 0).openList();
      },
      preventDefault: true
    }, {
      keys: ['enter'],
      callback: () => this.select()
    }, {
      keys: ['escape'],
      callback: () => this.closeList(true)
    }]);

    const ignores = [9, 13, 27];
    // filter keyup listener
    keyvent.up(this.input, (e) => {
      const filter = this.config.filter;
      if (ignores.indexOf(e.which) > -1 || !filter) { return; }
      this.filter().openList();
    });
  }

  filter(supress) {
    const filter = this.config.filter;
    const befores = this.currentOpts;
    this.currentOpts = typeof filter === 'function' ?
      filter(this.input.value.trim(), this.cachedOpts) :
      filters[filter](this.input.value.trim(), this.cachedOpts);
    // don't let user's functions break stuff
    this.currentOpts = this.currentOpts || [];
    this.updateOpts();
    // announce count only if it has changed
    if (!befores.every((b) => this.currentOpts.indexOf(b) > -1) && !supress) {
      this.announceCount();
    }
    return this;
  }

  announceCount() {
    if (this.config.announcement) {
      this.liveRegion.announce(
        this.config.announcement(this.currentOpts.length)
      );
    }

    return this;
  }

  updateOpts() {
    this.cachedOpts.forEach((opt) => {
      opt.style.display = this.currentOpts.indexOf(opt) === -1 ? 'none' : 'block';
    });

    return this;
  }

  select() {
    const currentOpt = this.currentOption;
    if (!currentOpt) { return; }
    const value = currentOpt.innerText;
    this.input.value = value;
    this.filter(true);
    this.input.select();
    this.closeList();
    this.emit('selection', { text: value, option: currentOpt });
    return this;
  }

  goTo(option) {
    if (typeof option === 'string') { // 'prev' or 'next'
      const optIndex = this.getOptIndex();
      return this.goTo(option === 'next' ? optIndex + 1 : optIndex - 1);
    }
    // NOTE: This prevents circularity
    if (!this.currentOpts[option]) { return this; }
    // update current option
    this.currentOption = this.currentOpts[option];
    // show pseudo focus styles
    this.pseudoFocus();
    return this;
  }

  pseudoFocus() {
    const option = this.currentOption;
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
        this.liveRegion.announce(this.currentOption.innerText);
      } else {
        this.input.setAttribute('aria-activedescendant', option.id);
      }
      this.currentOption = option;
      this.emit('change');
    }
  }
};
