'use strict';

import Classlist from 'classlist';
import Emitter from 'component-emitter';
import LiveRegion from 'live-region';
import scrollToElement from 'scrollto-element';
import inView from './lib/utils/is-scrolled-in-view';
import viewportStatus from './lib/utils/viewport-status';
import filters from './lib/filters';
import keyvent from './lib/utils/keyvent';
import isWithin from './lib/utils/is-within';
import elHandler from './lib/utils/element-handler';
import getCurrentGroup from './lib/current-group';
import noResultsHandler from './lib/no-results';
import attrs from './lib/attributes';
import wrapMatch from './lib/utils/wrap-match';
import configuration from './lib/config';
import announceActive from './lib/announce-active';

/**
 * /////////////////////////
 * //////// COMBOBO ////////
 * /////////////////////////
 *
 *           ."`".
 *       .-./ _=_ \.-.
 *      {  (,(oYo),) }}
 *      {{ |   "   |} }
 *      { { \(---)/  }}
 *      {{  }'-=-'{ } }
 *      { { }._:_.{  }}
 *      {{  } -:- { } }
 *      {_{ }`===`{  _}
 *     ((((\)     (/))))
 */

module.exports = class Combobo {
  constructor(config) {
    config = config || {};

    // merge user config with default config
    this.config = configuration(config);
    this.input = elHandler(this.config.input);
    this.list = elHandler(this.config.list);
    this.cachedOpts = this.currentOpts = elHandler((this.config.options), true, this.list);

    // initial state
    this.isOpen = false;
    this.currentOption = null;
    this.selected = [];
    this.groups = [];
    this.isHovering = false;
    this.autoFilter = this.config.autoFilter;
    this.optionsWithEventHandlers = new Set();


    // option groups
    if (this.config.groups) {
      const groupEls = elHandler(this.config.groups, true, this.list);
      this.groups = groupEls.map((groupEl) => {
        return {
          element: groupEl,
          options: this.cachedOpts.filter((opt) => groupEl.contains(opt))
        };
      });
    }

    if (!this.input || !this.list) {
      throw new Error('Unable to find required elements (list/input)');
    }

    attrs(this.input, this.list, this.cachedOpts);

    if (this.config.useLiveRegion) {
      this.liveRegion = new LiveRegion({ ariaLive: 'assertive' });
    }

    this.initEvents();
  }

  initEvents() {
    Emitter(this);

    this.input.addEventListener('click', () => {
      this.openList().goTo(this.getOptIndex() || 0); // ensure its open
    });

    this.input.addEventListener('blur', () => {
      if (!this.isHovering) { this.closeList(); }
    });

    this.input.addEventListener('focus', () => {
      if (this.selected.length) {
        this.input.value = this.selected.length >= 2 ? '' : this.config.selectionValue(this.selected);
      }
      this.input.select();
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

  optionEvents() {
    this.cachedOpts.forEach((option) => {
      // The event should not be added again for already selected options and existing options
      if (!this.optionsWithEventHandlers.has(option.id) && !this.selected.includes(option)) {
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
          this.optionsWithEventHandlers.add(option.id);
      }
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
    const status = viewportStatus(this.list);
    if (!status.visible) {
      const offset = status.position === 'bottom' ?
        0 - (window.innerHeight - (this.input.clientHeight + this.list.clientHeight)) :
        0;

      scrollToElement({
        element: this.input,
        offset: offset,
        bezier: [0.19, 1, 0.22, 1],
        duration: 100
      });
    }

    return this;
  }

  closeList(focus, selectText) {
    Classlist(this.list).remove(this.config.openClass);
    this.input.setAttribute('aria-expanded', 'false');
    this.isOpen = false;
    if (focus) { this.input.focus(); }
    // Set the value back to what it was
    if (!this.multiselect && this.selected.length) {
      this.input.value = this.config.selectionValue(this.selected);
    }

    if (selectText) { this.input.select(); }
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
          if (this.currentOpts.indexOf(this.currentOption) === -1) {
            return this.goTo(0, true);
          }
          return this.goTo(k === 'down' ? 'next' : 'prev', true);
        }

        const idx = this.selected.length
          ? this.currentOpts.indexOf(this.selected[this.selected.length -1])
          : 0

        this
          .goTo(idx, true)
          .openList();
      },
      preventDefault: true
    }, {
      keys: ['enter'],
      callback: (e) => {
        if (this.isOpen) {
          e.preventDefault();
          e.stopPropagation();
          this.select();
        }
      }
    }, {
      keys: ['escape'],
      callback: (e) => {
        if (this.isOpen) {
          e.stopPropagation();
          this.closeList(true, true);
        }
      }
    }, {
      keys: ['backspace'],
      callback: () => {
        if (this.selected.length >= 2) {
          this.input.value = '';
        }
      }
    }]);

    // ignore tab, enter, escape and shift
    const ignores = [9, 13, 27, 16];
    // filter keyup listener
    keyvent.up(this.input, (e) => {
      // If autoFilter is false, key up filter not required
      if(!this.autoFilter) {
        return;
      }
      const filter = this.config.filter;
      const cachedVal = this.cachedInputValue;
      if (ignores.indexOf(e.which) > -1 || !filter) { return; }

      // Handles if there is a fresh selection
      if (this.freshSelection) {
        this.clearFilters();
        if (cachedVal && (cachedVal.trim() !== this.input.value.trim())) { // if the value has changed...
          this.filter().openList();
          this.freshSelection = false;
        }
      } else {
        this.filter().openList();
      }

      // handle empty results
      noResultsHandler(this.list, this.currentOpts, this.config.noResultsText);
    });
  }

  clearFilters() {
    this.cachedOpts.forEach((o) => o.style.display = '');
    this.groups.forEach((g) => g.element.style.display = '');
    // show all opts
    this.currentOpts = this.cachedOpts;
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
    const count = this.config.announcement && this.config.announcement.count;

    if (count && this.liveRegion) {
      this.liveRegion.announce(count(this.currentOpts.length), 500);
    }

    return this;
  }

  updateOpts() {
    const optVal = this.config.optionValue;
    this.cachedOpts.forEach((opt) => {
      // configure display of options based on filtering
      opt.style.display = this.currentOpts.indexOf(opt) === -1 ? 'none' : '';

      // configure the innerHTML of each option
      opt.innerHTML = typeof optVal === 'string' ?
        wrapMatch(opt, this.input, optVal) :
        optVal(opt);
    });

    this.updateGroups();
    return this;
  }

  updateGroups() {
    this.groups.forEach((groupData) => {
      const visibleOpts = groupData.options.filter((opt) => opt.style.display === '');
      groupData.element.style.display = visibleOpts.length ? '' : 'none';
    });
    return this;
  }

  select() {
    const currentOpt = this.currentOption;
    if (!currentOpt) { return; }

    if (!this.config.multiselect && this.selected.length) { // clean up previously selected
      Classlist(this.selected[0]).remove(this.config.selectedClass)
    }

    const idx = this.selected.indexOf(currentOpt);
    const wasSelected = idx > -1;

    // Multiselect option
    if (this.config.multiselect) {
      // If option is in array and gets clicked, remove it
      if (wasSelected) {
        this.selected.splice(idx, 1);
      } else {
        this.selected.push(currentOpt);
      }
    } else {
      this.selected = this.config.allowEmpty && wasSelected
        ? []
        : [currentOpt]
    }

    // manage aria-selected
    this.cachedOpts.forEach((o) => {
      o.setAttribute('aria-selected', this.selected.indexOf(o) > -1 ? 'true' : 'false');
    });

    if (wasSelected) {
      currentOpt.classList.remove(this.config.selectedClass);
      this.emit('deselection', { text: this.input.value, option: currentOpt });
    } else {
      currentOpt.classList.add(this.config.selectedClass)
      this.emit('selection', { text: this.input.value, option: currentOpt });
    }

    this.freshSelection = true;
    this.input.value = this.selected.length
      ? this.config.selectionValue(this.selected)
      : '';
    this.cachedInputValue = this.input.value;
    this.filter(true).clearFilters()

    // close the list for single select
    // (leave it open for multiselect)
    if (!this.config.multiselect) {
      this.closeList();
      this.input.select();
    }

    return this;
  }

  reset() {
    this.clearFilters();
    this.input.value = '';
    this.updateOpts();
    this.input.removeAttribute('aria-activedescendant');
    this.input.removeAttribute('data-active-option');
    this.currentOption = null;
    this.selected = [];
    this.cachedOpts.forEach((optEl) => {
      Classlist(optEl).remove(this.config.selectedClass);
      Classlist(optEl).remove(this.config.activeClass);
      optEl.setAttribute('aria-selected', 'false');
    });
    return this;
  }

  goTo(option, fromKey) {
    if (typeof option === 'string') { // 'prev' or 'next'
      const optIndex = this.getOptIndex();
      return this.goTo(option === 'next' ? optIndex + 1 : optIndex - 1, fromKey);
    }

    const newOpt = this.currentOpts[option];
    let groupChange = false;

    if (!this.currentOpts[option]) {
      // end of the line so allow scroll up for visibility of potential group labels
      if (this.getOptIndex() === 0) { this.list.scrollTop = 0; }
      return this;
    } else if (this.groups.length) {
      const newGroup = getCurrentGroup(this.groups, newOpt);
      groupChange = newGroup && newGroup !== this.currentGroup;
      this.currentGroup = newGroup;
    }

    // update current option
    this.currentOption = newOpt;
    // show pseudo focus styles
    this.pseudoFocus(groupChange);
    // Dectecting if element is inView and scroll to it.
    this.currentOpts.forEach((opt) => {
      if (opt.classList.contains(this.config.activeClass) && !inView(this.list, opt)) {
        scrollToElement(opt);
      }
    });

    return this;
  }

  pseudoFocus(groupChanged) {
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
        announceActive(
          option,
          this.config,
          this.liveRegion.announce.bind(this.liveRegion),
          groupChanged,
          this.currentGroup && this.currentGroup.element
        );
      }

      this.input.setAttribute('aria-activedescendant', option.id);
      this.currentOption = option;
      this.emit('change');
    }
    return this;
  }

  
  setOptions(option){ 
    // The below code adds the  new option to current Dropdown list
    if(typeof option === 'object'){ // This needs to be check for passing unit test
     this.config.list.append(option);
    }
    this.cachedOpts.push(option);
    this.currentOpts.push(option);
    return this;
  }

  setCurrentOptions() {
    this.currentOption = this.currentOpts[0]; // Sets the current option index
    return this;
  }

  updateSelectedOptions(){
    const list = document.getElementById(this.config.list.id);
    const selectedList = this.selected;
    this.emptyDropdownList()

    // The below code will remove all child elements in the dropdown list
    while (list.hasChildNodes()) {
        list.removeChild(list.firstChild);
    }
    // The below code will append the selected options to the dropdown list if any
    if (selectedList.length > 0) {
        selectedList.forEach(item => {
            this.setOption(item);
        });
    }
    return this;
  }

  
  emptyDropdownList(){
    // empty the cachedOpts and currentOpts of dropdown list
    this.currentOpts = [];
    this.cachedOpts = [];
    this.optionsWithEventHandlers.clear();
    return this;
  }

  setNoResultFound (){
    // handle empty results whenever user perform search and if no relevant records found 
    noResultsHandler(this.list, this.currentOpts, this.config.noResultsText);
  }

};

/**
 * NOTE:
 * - https://www.w3.org/TR/2016/WD-wai-aria-practices-1.1-20160317/#combobox
 *    - "For each combobox pattern the button need not be in the tab order if there
 *    is an appropriate keystroke associated with the input element such that when
 *    focus is on the input, the keystroke triggers display of the associated drop
 *    down list."
 */
