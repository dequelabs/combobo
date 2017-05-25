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
const filters = require('./lib/filters');
const keyvent = require('./lib/keyvent');
const isWithin = require('./lib/is-within');
const isInView = require('./lib/is-in-view');
const elHandler = require('./lib/element-handler');

const defaults = {
  input: '.combobox',
  list: '.listbox',
  options: '.option', // qualified within `list`
  groups: null, // qualified within `list`
  openClass: 'open',
  activeClass: 'active',
  selectedClass: 'selected',
  useLiveRegion: true,
  multiselect: false,
  selectionValue: (selecteds) => selecteds.map((s) => s.innerText.trim()).join(' - '),
  announcement: (n) => `${n} options available`,
  filter: 'contains' // 'starts-with', 'equals', or funk
};

module.exports = class Combobox {
  constructor(config) {
    config = config || {};

    // merge user config with default config
    this.config = {};
    extend(this.config, defaults, config);

    this.input = elHandler(this.config.input);
    this.list = elHandler(this.config.list);
    this.cachedOpts = this.currentOpts = elHandler((this.config.options), true, this.list);

    // option groups
    if (this.config.groups) {
      const groupEls = elHandler(this.config.groups, true, this.list);
      this.isGrouped = true;
      this.groups = groupEls.map((groupEl) => {
        return {
          element: groupEl,
          options: this.cachedOpts.filter((opt) => groupEl.contains(opt))
        };
      });
    }

    // initial state
    this.isOpen = false;
    this.liveRegion = null;
    this.currentOption = null;
    this.selected = [];
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
      this.reset();
      this.freshSelection = true;
    });

    // listen for clicks outside of combobox
    document.addEventListener('click', (e) => {
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
    if (!this.multiselect && this.selected.length) {
      this.input.value = this.config.selectionValue(this.selected);
    }
    return this;
  }

  initKeys() {
    // keydown listener
    keyvent.down(this.input, [{
      keys: ['up', 'down'],
      callback: (e, k) => {
        if (this.isOpen) {
          // if typing filtered out the pseudo-current option
          if (this.currentOpts.indexOf(this.currentOption) === -1) { return this.goTo(0, true); }
          return this.goTo(k === 'down' ? 'next' : 'prev', true);
        }
        this.goTo(this.currentOption ? this.getOptIndex() : 0, true).openList();
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
      const currentVal = this.selected.length && this.selected[this.selected.length - 1].innerText;
      if (ignores.indexOf(e.which) > -1 || !filter) { return; }

      if (this.freshSelection) {
        this.reset();
        if (currentVal && (currentVal !== this.input.value.trim())) { // if the value has changed...
          this.filter().openList();
          this.freshSelection = false;
        }
      } else {
        this.filter().openList();
      }
    });
  }

  reset() {
    this.cachedOpts.forEach((opt) => {
      opt.style.display = '';
    });

    if (this.isGrouped) {
      this.groups.forEach((g) => {
        g.element.style.display = '';
      });
    }
    this.currentOpts = this.cachedOpts; // reset the opts
    return this;
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
      opt.style.display = this.currentOpts.indexOf(opt) === -1 ? 'none' : '';
    });

    this.updateGroups();
    return this;
  }

  updateGroups() {
    if (this.isGrouped) {
      this.groups.forEach((groupData) => {
        const visibleOpts = groupData.options.filter((opt) => opt.style.display === '');
        groupData.element.style.display = visibleOpts.length ? '' : 'none';
      });
    }
    return this;
  }

  select() {
    const currentOpt = this.currentOption;
    if (!currentOpt) { return; }

    if (!this.config.multiselect && this.selected.length) { // clean up previously selected
      Classlist(this.selected[0]).remove(this.config.selectedClass)
    }

    if (this.config.multiselect) {
      this.selected.push(currentOpt);
    } else {
      this.selected = [currentOpt];
    }

    currentOpt.classList.add(this.config.selectedClass);
    const value = this.config.selectionValue(this.selected);

    this.input.value = value;
    this.filter(true);
    this.reset();
    this.input.select();
    this.closeList();
    this.freshSelection = true;
    this.emit('selection', { text: value, option: currentOpt });
    return this;
  }

  goTo(option, fromKey) {
    if (typeof option === 'string') { // 'prev' or 'next'
      const optIndex = this.getOptIndex();
      return this.goTo(option === 'next' ? optIndex + 1 : optIndex - 1, fromKey);
    }
    // NOTE: This prevents circularity
    if (!this.currentOpts[option]) {
      // end of the line so allow scroll up for visibility of potential group labels
      if (this.getOptIndex() === 0) { this.list.scrollTop = 0; }
      return this;
    }
    // update current option
    this.currentOption = this.currentOpts[option];
    // show pseudo focus styles
    this.pseudoFocus();
    if (fromKey) { this.ensureVisible(); }
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

  ensureVisible() {
    if (isInView(this.currentOption)) { return; }
    this.list.scrollTop = this.currentOption.offsetTop;
  }
};
