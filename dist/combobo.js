"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }g.Combobo = f();
  }
})(function () {
  var define, module, exports;return function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
        }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
      s(r[o]);
    }return s;
  }({ 1: [function (require, module, exports) {
      'use strict';

      var Classlist = require('classlist');
      var extend = require('extend-shallow');
      var Emitter = require('component-emitter');
      var LiveRegion = require('live-region');
      var scrollToElement = require('scrollto-element');
      var inView = require('./lib/utils/is-scrolled-in-view');
      var viewportStatus = require('./lib/utils/viewport-status');
      var filters = require('./lib/filters');
      var keyvent = require('./lib/utils/keyvent');
      var isWithin = require('./lib/utils/is-within');
      var elHandler = require('./lib/utils/element-handler');
      var getCurrentGroup = require('./lib/current-group');
      var attrs = require('./lib/attributes');
      var wrapMatch = require('./lib/utils/wrap-match');
      var defaults = require('./lib/defaults');

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

      module.exports = function () {
        function Combobo(config) {
          var _this = this;

          _classCallCheck(this, Combobo);

          config = config || {};

          // merge user config with default config
          this.config = {};
          var announcementConfig = {};
          config.announcement = config.announcement || {};
          extend(announcementConfig, defaults.announcement, config.announcement);
          extend(this.config, defaults, config);
          this.config.announcement = announcementConfig;

          this.input = elHandler(this.config.input);
          this.list = elHandler(this.config.list);
          this.cachedOpts = this.currentOpts = elHandler(this.config.options, true, this.list);
          // initial state
          this.isOpen = false;
          this.currentOption = null;
          this.selected = [];
          this.groups = [];
          this.isHovering = false;

          // option groups
          if (this.config.groups) {
            var groupEls = elHandler(this.config.groups, true, this.list);
            this.groups = groupEls.map(function (groupEl) {
              return {
                element: groupEl,
                options: _this.cachedOpts.filter(function (opt) {
                  return groupEl.contains(opt);
                })
              };
            });
          }

          attrs(this.input, this.list, this.cachedOpts);

          if (this.config.useLiveRegion) {
            this.liveRegion = new LiveRegion({ ariaLive: 'assertive' });
          }

          this.initEvents();
        }

        _createClass(Combobo, [{
          key: "initEvents",
          value: function initEvents() {
            var _this2 = this;

            Emitter(this);

            this.input.addEventListener('click', function () {
              _this2.openList().goTo(_this2.getOptIndex() || 0); // ensure its open
            });

            this.input.addEventListener('blur', function () {
              if (!_this2.isHovering) {
                _this2.closeList();
              }
            });

            this.input.addEventListener('focus', function () {
              if (_this2.selected.length) {
                _this2.input.value = _this2.selected.length >= 2 ? '' : _this2.config.selectionValue(_this2.selected);
              }
            });

            // listen for clicks outside of combobox
            document.addEventListener('click', function (e) {
              var isOrWithin = isWithin(e.target, [_this2.input, _this2.list], true);
              if (!isOrWithin && _this2.isOpen) {
                _this2.closeList();
              }
            });

            this.optionEvents();
            this.initKeys();
          }
        }, {
          key: "getOptIndex",
          value: function getOptIndex() {
            return this.currentOption && this.currentOpts.indexOf(this.currentOption);
          }
        }, {
          key: "optionEvents",
          value: function optionEvents() {
            var _this3 = this;

            this.cachedOpts.forEach(function (option) {
              option.addEventListener('click', function () {
                _this3.goTo(_this3.currentOpts.indexOf(option)).select();
              });

              option.addEventListener('mouseover', function () {
                // clean up
                var prev = _this3.currentOption;
                if (prev) {
                  Classlist(prev).remove(_this3.config.activeClass);
                }
                Classlist(option).add(_this3.config.activeClass);
                _this3.isHovering = true;
              });

              option.addEventListener('mouseout', function () {
                Classlist(option).remove(_this3.config.activeClass);
                _this3.isHovering = false;
              });
            });
          }
        }, {
          key: "openList",
          value: function openList() {
            Classlist(this.list).add(this.config.openClass);
            this.input.setAttribute('aria-expanded', 'true');
            if (!this.isOpen) {
              // announcing count
              this.announceCount();
            }
            this.isOpen = true;
            this.emit('list:open');
            var status = viewportStatus(this.list);
            if (!status.visible) {
              var offset = status.position === 'bottom' ? 0 - (window.innerHeight - (this.input.clientHeight + this.list.clientHeight)) : 0;

              scrollToElement({
                element: this.input,
                offset: offset,
                bezier: [0.19, 1, 0.22, 1],
                duration: 100
              });
            }

            return this;
          }
        }, {
          key: "closeList",
          value: function closeList(focus) {
            Classlist(this.list).remove(this.config.openClass);
            this.input.setAttribute('aria-expanded', 'false');
            this.isOpen = false;
            if (focus) {
              this.input.focus();
            }
            // Sets the value back to what it was
            if (!this.multiselect && this.selected.length) {
              this.input.value = this.config.selectionValue(this.selected);
            }
            this.emit('list:close');
            return this;
          }
        }, {
          key: "initKeys",
          value: function initKeys() {
            var _this4 = this;

            // keydown listener
            keyvent.down(this.input, [{
              keys: ['up', 'down'],
              callback: function callback(e, k) {
                if (_this4.isOpen) {
                  // if typing filtered out the pseudo-current option
                  if (_this4.currentOpts.indexOf(_this4.currentOption) === -1) {
                    return _this4.goTo(0, true);
                  }
                  return _this4.goTo(k === 'down' ? 'next' : 'prev', true);
                }
                _this4.goTo(_this4.currentOption ? _this4.getOptIndex() : 0, true).openList();
              },
              preventDefault: true
            }, {
              keys: ['enter'],
              callback: function callback(e) {
                e.preventDefault();
                e.stopPropagation();
                _this4.select();
              }
            }, {
              keys: ['escape'],
              callback: function callback(e) {
                e.stopPropagation();
                _this4.closeList(true);
              }
            }, {
              keys: ['backspace'],
              callback: function callback() {
                if (_this4.selected.length >= 2) {
                  _this4.input.value = '';
                }
              }
            }]);

            var ignores = [9, 13, 27];
            // filter keyup listener
            keyvent.up(this.input, function (e) {
              var filter = _this4.config.filter;
              var cachedVal = _this4.cachedInputValue;
              if (ignores.indexOf(e.which) > -1 || !filter) {
                return;
              }

              // Handles if there is a fresh selection
              if (_this4.freshSelection) {
                _this4.reset();
                if (cachedVal && cachedVal.trim() !== _this4.input.value.trim()) {
                  // if the value has changed...
                  _this4.filter().openList();
                  _this4.freshSelection = false;
                }
              } else {
                _this4.filter().openList();
              }

              // Handles if there are no results found
              var noResults = _this4.list.querySelector('.no-results-text');
              if (_this4.config.noResultsText && !_this4.currentOpts.length && !noResults) {
                noResults = document.createElement('div');
                Classlist(noResults).add('no-results-text');
                noResults.innerHTML = _this4.config.noResultsText;
                _this4.list.appendChild(noResults);
              } else if (noResults && _this4.currentOpts.length) {
                _this4.list.removeChild(noResults);
              }
            });
          }
        }, {
          key: "reset",
          value: function reset() {
            this.cachedOpts.forEach(function (opt) {
              opt.style.display = '';
            });

            this.groups.forEach(function (g) {
              g.element.style.display = '';
            });

            this.currentOpts = this.cachedOpts; // reset the opts
            return this;
          }
        }, {
          key: "filter",
          value: function filter(supress) {
            var _this5 = this;

            var filter = this.config.filter;
            var befores = this.currentOpts;
            this.currentOpts = typeof filter === 'function' ? filter(this.input.value.trim(), this.cachedOpts) : filters[filter](this.input.value.trim(), this.cachedOpts);
            // don't let user's functions break stuff
            this.currentOpts = this.currentOpts || [];
            this.updateOpts();
            // announce count only if it has changed
            if (!befores.every(function (b) {
              return _this5.currentOpts.indexOf(b) > -1;
            }) && !supress) {
              this.announceCount();
            }

            return this;
          }
        }, {
          key: "announceCount",
          value: function announceCount() {
            if (this.config.announcement && this.config.announcement.count && this.liveRegion) {
              this.liveRegion.announce(this.config.announcement.count(this.currentOpts.length), 500);
            }

            return this;
          }
        }, {
          key: "updateOpts",
          value: function updateOpts() {
            var _this6 = this;

            var optVal = this.config.optionValue;
            this.cachedOpts.forEach(function (opt) {
              // configure display of options based on filtering
              opt.style.display = _this6.currentOpts.indexOf(opt) === -1 ? 'none' : '';

              // configure the innerHTML of each option
              opt.innerHTML = typeof optVal === 'string' ? wrapMatch(opt, _this6.input, optVal) : optVal(opt);
            });

            this.updateGroups();
            return this;
          }
        }, {
          key: "updateGroups",
          value: function updateGroups() {
            this.groups.forEach(function (groupData) {
              var visibleOpts = groupData.options.filter(function (opt) {
                return opt.style.display === '';
              });
              groupData.element.style.display = visibleOpts.length ? '' : 'none';
            });
            return this;
          }
        }, {
          key: "select",
          value: function select() {
            var newSelected = false;
            var currentOpt = this.currentOption;
            if (!currentOpt) {
              return;
            }

            if (!this.config.multiselect && this.selected.length) {
              // clean up previously selected
              Classlist(this.selected[0]).remove(this.config.selectedClass);
            }

            // Multiselect option
            if (this.config.multiselect) {
              var idx = this.selected.indexOf(currentOpt);
              //If option is in array and gets clicked, remove it
              if (idx > -1) {
                this.selected.splice(idx, 1);
              } else {
                this.selected.push(currentOpt);
              }
            } else {
              // Single select stuff
              this.selected = [currentOpt];
            }

            // Taking care of adding / removing selected class
            if (Classlist(currentOpt).contains(this.config.selectedClass)) {
              currentOpt.classList.remove(this.config.selectedClass);
              this.emit('deselection', { text: this.input.value, option: currentOpt });
            } else {
              newSelected = true;
              currentOpt.classList.add(this.config.selectedClass);
            }

            this.input.value = this.selected.length ? this.config.selectionValue(this.selected) : '';
            this.cachedInputValue = this.input.value;
            this.filter(true);
            this.reset();
            this.input.select();
            this.closeList();

            if (newSelected) {
              this.freshSelection = true;
              this.emit('selection', { text: this.input.value, option: currentOpt });
            }

            return this;
          }
        }, {
          key: "goTo",
          value: function goTo(option, fromKey) {
            var _this7 = this;

            if (typeof option === 'string') {
              // 'prev' or 'next'
              var optIndex = this.getOptIndex();
              return this.goTo(option === 'next' ? optIndex + 1 : optIndex - 1, fromKey);
            }

            var newOpt = this.currentOpts[option];
            var groupChange = false;

            if (!this.currentOpts[option]) {
              // end of the line so allow scroll up for visibility of potential group labels
              if (this.getOptIndex() === 0) {
                this.list.scrollTop = 0;
              }
              return this;
            } else if (this.groups.length) {
              var newGroup = getCurrentGroup(this.groups, newOpt);
              groupChange = newGroup && newGroup !== this.currentGroup;
              this.currentGroup = newGroup;
            }

            // update current option
            this.currentOption = newOpt;
            // show pseudo focus styles
            this.pseudoFocus(groupChange);
            // Dectecting if element is inView and scroll to it.
            this.currentOpts.forEach(function (opt) {
              if (opt.classList.contains('active') && !inView(_this7.list, opt)) {
                scrollToElement(opt);
              }
            });

            return this;
          }
        }, {
          key: "pseudoFocus",
          value: function pseudoFocus(groupChanged) {
            var option = this.currentOption;
            var activeClass = this.config.activeClass;
            var prevId = this.input.getAttribute('data-active-option');
            var prev = prevId && document.getElementById(prevId);

            // clean up
            if (prev && activeClass) {
              Classlist(prev).remove(activeClass);
            }

            if (option) {
              this.input.setAttribute('data-active-option', option.id);
              if (activeClass) {
                Classlist(option).add(activeClass);
              }

              if (this.liveRegion) {
                var msg = this.currentOption.innerText; // TODO: make this more configurable
                msg = groupChanged && this.config.announcement && this.config.announcement.groupChange ? this.config.announcement.groupChange(this.currentGroup.element) + " " + msg : msg;
                this.liveRegion.announce(msg, 500);
              } else {
                this.input.setAttribute('aria-activedescendant', option.id);
              }

              this.currentOption = option;
              this.emit('change');
            }

            return this;
          }
        }]);

        return Combobo;
      }();

      /**
       * NOTE:
       * - https://www.w3.org/TR/2016/WD-wai-aria-practices-1.1-20160317/#combobox
       *    - "For each combobox pattern the button need not be in the tab order if there
       *    is an appropriate keystroke associated with the input element such that when
       *    focus is on the input, the keystroke triggers display of the associated drop
       *    down list."
       */
    }, { "./lib/attributes": 2, "./lib/current-group": 3, "./lib/defaults": 4, "./lib/filters": 5, "./lib/utils/element-handler": 6, "./lib/utils/is-scrolled-in-view": 7, "./lib/utils/is-within": 8, "./lib/utils/keyvent": 10, "./lib/utils/viewport-status": 13, "./lib/utils/wrap-match": 14, "classlist": 19, "component-emitter": 20, "extend-shallow": 22, "live-region": 25, "scrollto-element": 28 }], 2: [function (require, module, exports) {
      'use strict';

      var rndid = require('./utils/rndid');

      /**
       * Sets attributes on input / list / options
       */
      module.exports = function (input, list, options) {
        list.id = list.id || rndid();

        input.setAttribute('role', 'combobox');
        list.setAttribute('role', 'listbox');
        input.setAttribute('aria-owns', list.id);
        input.setAttribute('aria-autocomplete', 'list');
        input.setAttribute('aria-expanded', 'false');

        options.forEach(function (opt) {
          opt.setAttribute('role', 'option');
          opt.id = opt.id || rndid();
        });
      };
    }, { "./utils/rndid": 11 }], 3: [function (require, module, exports) {
      'use strict';

      module.exports = function (groups, option) {
        var matches = groups.filter(function (g) {
          return g.options.indexOf(option) > -1;
        });
        return matches.length && matches[0];
      };
    }, {}], 4: [function (require, module, exports) {
      'use strict';

      /**
       * The default config for Combobo
       * @type {Object}
       */

      module.exports = {
        input: '.combobox',
        list: '.listbox',
        options: '.option', // qualified within `list`
        groups: null, // qualified within `list`
        openClass: 'open',
        activeClass: 'active',
        selectedClass: 'selected',
        useLiveRegion: true,
        multiselect: false,
        noResultsText: null,
        selectionValue: function selectionValue(selecteds) {
          return selecteds.map(function (s) {
            return s.innerText.trim();
          }).join(' - ');
        },
        optionValue: function optionValue(option) {
          return option.innerHTML;
        },
        announcement: {
          count: function count(n) {
            return n + " options available";
          }
        },
        filter: 'contains' // 'starts-with', 'equals', or funk
      };
    }, {}], 5: [function (require, module, exports) {
      'use strict';

      var val = require('./value');

      module.exports = {
        'contains': function contains(text, opts) {
          return opts.filter(function (o) {
            return val(o).toLowerCase().indexOf(text.toLowerCase()) > -1;
          });
        },
        'equals': function equals(text, opts) {
          return opts.filter(function (o) {
            return val(o).toLowerCase() === text.toLowerCase();
          });
        },
        'starts-with': function startsWith(text, opts) {
          return opts.filter(function (o) {
            return val(o).toLowerCase().indexOf(text.toLowerCase()) === 0;
          });
        }
      };
    }, { "./value": 15 }], 6: [function (require, module, exports) {
      'use strict';

      var select = require('./select');

      module.exports = function (l, all, context) {
        context = context || document;
        if (typeof l === 'string') {
          return all ? select.all(l, context) : select(l, context);
        }

        return l;
      };
    }, { "./select": 12 }], 7: [function (require, module, exports) {
      'use strict';

      /**
       * Checks if an option is COMPLETELY visible in a list
       * @param  {HTMLElement} list The scrollable list element
       * @param  {HTMLElement} opt  The option in question
       * @return {Boolean}
       */

      module.exports = function (list, opt) {
        var listHeight = list.clientHeight;
        var optHeight = opt.clientHeight;
        var scrollTop = list.scrollTop;
        var offsetTop = opt.offsetTop;
        var isAbove = scrollTop > offsetTop;
        var isBelow = scrollTop + listHeight - optHeight < offsetTop;

        return !isAbove && !isBelow;
      };
    }, {}], 8: [function (require, module, exports) {
      'use strict';

      module.exports = function (target, els, checkSelf) {
        els = !els.length ? [els] : els;

        if (checkSelf && els.indexOf(target) > -1) {
          return true;
        }
        var parent = target.parentNode;
        // walk
        while (parent && parent.tagName !== 'HTML') {
          if (els.indexOf(parent) > -1) {
            return true;
          }
          parent = parent.parentNode;
        }

        return false;
      };
    }, {}], 9: [function (require, module, exports) {
      'use strict';

      module.exports = {
        8: 'backspace',
        9: 'tab',
        13: 'enter',
        27: 'escape',
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
      };
    }, {}], 10: [function (require, module, exports) {
      'use strict';

      var keymap = require('./keymap');

      /**
       * attach
       * @param  {String} eventType the type of keyboard event to be attached
       * @param  {HTMLElement} target    the desired target
       * @param  {Object} config    An array of keys / callbacks
       */
      exports.attach = function (eventType, target, config) {
        if (typeof config === 'function') {
          return target.addEventListener(eventType, config);
        }
        if (!config || !config.length) {
          return;
        }
        target.addEventListener(eventType, function (e) {
          var keyName = keymap[e.which];

          config.forEach(function (c) {
            if (c.keys.indexOf(keyName) > -1) {
              if (c.preventDefault) {
                e.preventDefault();
              }
              c.callback(e, keyName);
            }
          });
        });
      };

      /**
       * Example usage:
       * const keyboard = require('keyvent');
       * keyboard.up(element, [
       *   {
       *     keys: ['space', 'enter'],
       *     callback: funk
       *   }
       * ]);
       */

      exports.up = function (el, config) {
        return exports.attach('keyup', el, config);
      };
      exports.down = function (el, config) {
        return exports.attach('keydown', el, config);
      };
      exports.press = function (el, config) {
        return exports.attach('keypress', el, config);
      };
    }, { "./keymap": 9 }], 11: [function (require, module, exports) {
      'use strict';

      var rndm = require('rndm');

      module.exports = rndid;

      function rndid(len) {
        len = len || 8;
        var id = rndm(len);
        if (document.getElementById(id)) {
          return rndid(len);
        }

        return id;
      }
    }, { "rndm": 27 }], 12: [function (require, module, exports) {
      'use strict';

      exports = module.exports = function (selector, context) {
        context = context || document;
        return context.querySelector(selector);
      };

      exports.all = function (selector, context) {
        context = context || document;
        return Array.prototype.slice.call(context.querySelectorAll(selector));
      };
    }, {}], 13: [function (require, module, exports) {
      'use strict';

      /**
       * Checks if `target` is completely in viewport and returns an object containing:
       * - {Boolean} visible   if the target is visible
       * - {String}  position  the position the element is offscreen ('top' or 'bottom')
       *
       * @param  {HTMLElement} target the element in question
       * @return {Object}
       */

      module.exports = function (target) {
        var windowHeight = window.innerHeight;
        var rect = target.getBoundingClientRect();
        var isOffTop = rect.top < 0;
        var isOffBottom = rect.bottom > windowHeight;
        var isVisible = !isOffTop && !isOffBottom;
        var data = {
          visible: isVisible
        };

        if (!isVisible) {
          data.position = isOffTop ? 'top' : 'bottom';
        }

        return data;
      };
    }, {}], 14: [function (require, module, exports) {
      'use strict';

      /**
       * Wraps any matches (between input value on option) in a span with the accent class
       * @param  {HTMLElement} optionEl    The option element
       * @param  {HTMLElement} input       The input element
       * @param  {String} accentClass      The class to be added to the match span
       * @return {String}                  The result html string
       */

      module.exports = function (optionEl, input, accentClass) {
        var inputText = input.value;
        var optionText = optionEl.innerText;
        var matchStart = optionText.toLowerCase().indexOf(inputText.toLowerCase());
        var matchLength = inputText.length;

        accentClass = accentClass || 'underline';

        if (inputText && matchStart >= 0) {
          var before = optionText.substring(0, matchStart);
          var matchText = optionText.substr(matchStart, matchLength);
          var after = optionText.substring(matchStart + matchLength);
          return before + "<span class=\"" + accentClass + "\">" + matchText + "</span>" + after;
        }

        return optionText;
      };
    }, {}], 15: [function (require, module, exports) {
      'use strict';

      module.exports = function (el) {
        return el.getAttribute('data-value') || el.innerText;
      };
    }, {}], 16: [function (require, module, exports) {
      (function (global) {
        'use strict';

        // compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
        // original notice:

        /*!
         * The buffer module from node.js, for the browser.
         *
         * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
         * @license  MIT
         */

        function compare(a, b) {
          if (a === b) {
            return 0;
          }

          var x = a.length;
          var y = b.length;

          for (var i = 0, len = Math.min(x, y); i < len; ++i) {
            if (a[i] !== b[i]) {
              x = a[i];
              y = b[i];
              break;
            }
          }

          if (x < y) {
            return -1;
          }
          if (y < x) {
            return 1;
          }
          return 0;
        }
        function isBuffer(b) {
          if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
            return global.Buffer.isBuffer(b);
          }
          return !!(b != null && b._isBuffer);
        }

        // based on node assert, original notice:

        // http://wiki.commonjs.org/wiki/Unit_Testing/1.0
        //
        // THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
        //
        // Originally from narwhal.js (http://narwhaljs.org)
        // Copyright (c) 2009 Thomas Robinson <280north.com>
        //
        // Permission is hereby granted, free of charge, to any person obtaining a copy
        // of this software and associated documentation files (the 'Software'), to
        // deal in the Software without restriction, including without limitation the
        // rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
        // sell copies of the Software, and to permit persons to whom the Software is
        // furnished to do so, subject to the following conditions:
        //
        // The above copyright notice and this permission notice shall be included in
        // all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        // AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
        // ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
        // WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

        var util = require('util/');
        var hasOwn = Object.prototype.hasOwnProperty;
        var pSlice = Array.prototype.slice;
        var functionsHaveNames = function () {
          return function foo() {}.name === 'foo';
        }();
        function pToString(obj) {
          return Object.prototype.toString.call(obj);
        }
        function isView(arrbuf) {
          if (isBuffer(arrbuf)) {
            return false;
          }
          if (typeof global.ArrayBuffer !== 'function') {
            return false;
          }
          if (typeof ArrayBuffer.isView === 'function') {
            return ArrayBuffer.isView(arrbuf);
          }
          if (!arrbuf) {
            return false;
          }
          if (arrbuf instanceof DataView) {
            return true;
          }
          if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
            return true;
          }
          return false;
        }
        // 1. The assert module provides functions that throw
        // AssertionError's when particular conditions are not met. The
        // assert module must conform to the following interface.

        var assert = module.exports = ok;

        // 2. The AssertionError is defined in assert.
        // new assert.AssertionError({ message: message,
        //                             actual: actual,
        //                             expected: expected })

        var regex = /\s*function\s+([^\(\s]*)\s*/;
        // based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
        function getName(func) {
          if (!util.isFunction(func)) {
            return;
          }
          if (functionsHaveNames) {
            return func.name;
          }
          var str = func.toString();
          var match = str.match(regex);
          return match && match[1];
        }
        assert.AssertionError = function AssertionError(options) {
          this.name = 'AssertionError';
          this.actual = options.actual;
          this.expected = options.expected;
          this.operator = options.operator;
          if (options.message) {
            this.message = options.message;
            this.generatedMessage = false;
          } else {
            this.message = getMessage(this);
            this.generatedMessage = true;
          }
          var stackStartFunction = options.stackStartFunction || fail;
          if (Error.captureStackTrace) {
            Error.captureStackTrace(this, stackStartFunction);
          } else {
            // non v8 browsers so we can have a stacktrace
            var err = new Error();
            if (err.stack) {
              var out = err.stack;

              // try to strip useless frames
              var fn_name = getName(stackStartFunction);
              var idx = out.indexOf('\n' + fn_name);
              if (idx >= 0) {
                // once we have located the function frame
                // we need to strip out everything before it (and its line)
                var next_line = out.indexOf('\n', idx + 1);
                out = out.substring(next_line + 1);
              }

              this.stack = out;
            }
          }
        };

        // assert.AssertionError instanceof Error
        util.inherits(assert.AssertionError, Error);

        function truncate(s, n) {
          if (typeof s === 'string') {
            return s.length < n ? s : s.slice(0, n);
          } else {
            return s;
          }
        }
        function inspect(something) {
          if (functionsHaveNames || !util.isFunction(something)) {
            return util.inspect(something);
          }
          var rawname = getName(something);
          var name = rawname ? ': ' + rawname : '';
          return '[Function' + name + ']';
        }
        function getMessage(self) {
          return truncate(inspect(self.actual), 128) + ' ' + self.operator + ' ' + truncate(inspect(self.expected), 128);
        }

        // At present only the three keys mentioned above are used and
        // understood by the spec. Implementations or sub modules can pass
        // other keys to the AssertionError's constructor - they will be
        // ignored.

        // 3. All of the following functions must throw an AssertionError
        // when a corresponding condition is not met, with a message that
        // may be undefined if not provided.  All assertion methods provide
        // both the actual and expected values to the assertion error for
        // display purposes.

        function fail(actual, expected, message, operator, stackStartFunction) {
          throw new assert.AssertionError({
            message: message,
            actual: actual,
            expected: expected,
            operator: operator,
            stackStartFunction: stackStartFunction
          });
        }

        // EXTENSION! allows for well behaved errors defined elsewhere.
        assert.fail = fail;

        // 4. Pure assertion tests whether a value is truthy, as determined
        // by !!guard.
        // assert.ok(guard, message_opt);
        // This statement is equivalent to assert.equal(true, !!guard,
        // message_opt);. To test strictly for the value true, use
        // assert.strictEqual(true, guard, message_opt);.

        function ok(value, message) {
          if (!value) fail(value, true, message, '==', assert.ok);
        }
        assert.ok = ok;

        // 5. The equality assertion tests shallow, coercive equality with
        // ==.
        // assert.equal(actual, expected, message_opt);

        assert.equal = function equal(actual, expected, message) {
          if (actual != expected) fail(actual, expected, message, '==', assert.equal);
        };

        // 6. The non-equality assertion tests for whether two objects are not equal
        // with != assert.notEqual(actual, expected, message_opt);

        assert.notEqual = function notEqual(actual, expected, message) {
          if (actual == expected) {
            fail(actual, expected, message, '!=', assert.notEqual);
          }
        };

        // 7. The equivalence assertion tests a deep equality relation.
        // assert.deepEqual(actual, expected, message_opt);

        assert.deepEqual = function deepEqual(actual, expected, message) {
          if (!_deepEqual(actual, expected, false)) {
            fail(actual, expected, message, 'deepEqual', assert.deepEqual);
          }
        };

        assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
          if (!_deepEqual(actual, expected, true)) {
            fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
          }
        };

        function _deepEqual(actual, expected, strict, memos) {
          // 7.1. All identical values are equivalent, as determined by ===.
          if (actual === expected) {
            return true;
          } else if (isBuffer(actual) && isBuffer(expected)) {
            return compare(actual, expected) === 0;

            // 7.2. If the expected value is a Date object, the actual value is
            // equivalent if it is also a Date object that refers to the same time.
          } else if (util.isDate(actual) && util.isDate(expected)) {
            return actual.getTime() === expected.getTime();

            // 7.3 If the expected value is a RegExp object, the actual value is
            // equivalent if it is also a RegExp object with the same source and
            // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
          } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
            return actual.source === expected.source && actual.global === expected.global && actual.multiline === expected.multiline && actual.lastIndex === expected.lastIndex && actual.ignoreCase === expected.ignoreCase;

            // 7.4. Other pairs that do not both pass typeof value == 'object',
            // equivalence is determined by ==.
          } else if ((actual === null || (typeof actual === "undefined" ? "undefined" : _typeof(actual)) !== 'object') && (expected === null || (typeof expected === "undefined" ? "undefined" : _typeof(expected)) !== 'object')) {
            return strict ? actual === expected : actual == expected;

            // If both values are instances of typed arrays, wrap their underlying
            // ArrayBuffers in a Buffer each to increase performance
            // This optimization requires the arrays to have the same type as checked by
            // Object.prototype.toString (aka pToString). Never perform binary
            // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
            // bit patterns are not identical.
          } else if (isView(actual) && isView(expected) && pToString(actual) === pToString(expected) && !(actual instanceof Float32Array || actual instanceof Float64Array)) {
            return compare(new Uint8Array(actual.buffer), new Uint8Array(expected.buffer)) === 0;

            // 7.5 For all other Object pairs, including Array objects, equivalence is
            // determined by having the same number of owned properties (as verified
            // with Object.prototype.hasOwnProperty.call), the same set of keys
            // (although not necessarily the same order), equivalent values for every
            // corresponding key, and an identical 'prototype' property. Note: this
            // accounts for both named and indexed properties on Arrays.
          } else if (isBuffer(actual) !== isBuffer(expected)) {
            return false;
          } else {
            memos = memos || { actual: [], expected: [] };

            var actualIndex = memos.actual.indexOf(actual);
            if (actualIndex !== -1) {
              if (actualIndex === memos.expected.indexOf(expected)) {
                return true;
              }
            }

            memos.actual.push(actual);
            memos.expected.push(expected);

            return objEquiv(actual, expected, strict, memos);
          }
        }

        function isArguments(object) {
          return Object.prototype.toString.call(object) == '[object Arguments]';
        }

        function objEquiv(a, b, strict, actualVisitedObjects) {
          if (a === null || a === undefined || b === null || b === undefined) return false;
          // if one is a primitive, the other must be same
          if (util.isPrimitive(a) || util.isPrimitive(b)) return a === b;
          if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
          var aIsArgs = isArguments(a);
          var bIsArgs = isArguments(b);
          if (aIsArgs && !bIsArgs || !aIsArgs && bIsArgs) return false;
          if (aIsArgs) {
            a = pSlice.call(a);
            b = pSlice.call(b);
            return _deepEqual(a, b, strict);
          }
          var ka = objectKeys(a);
          var kb = objectKeys(b);
          var key, i;
          // having the same number of owned properties (keys incorporates
          // hasOwnProperty)
          if (ka.length !== kb.length) return false;
          //the same set of keys (although not necessarily the same order),
          ka.sort();
          kb.sort();
          //~~~cheap key test
          for (i = ka.length - 1; i >= 0; i--) {
            if (ka[i] !== kb[i]) return false;
          }
          //equivalent values for every corresponding key, and
          //~~~possibly expensive deep test
          for (i = ka.length - 1; i >= 0; i--) {
            key = ka[i];
            if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects)) return false;
          }
          return true;
        }

        // 8. The non-equivalence assertion tests for any deep inequality.
        // assert.notDeepEqual(actual, expected, message_opt);

        assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
          if (_deepEqual(actual, expected, false)) {
            fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
          }
        };

        assert.notDeepStrictEqual = notDeepStrictEqual;
        function notDeepStrictEqual(actual, expected, message) {
          if (_deepEqual(actual, expected, true)) {
            fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
          }
        }

        // 9. The strict equality assertion tests strict equality, as determined by ===.
        // assert.strictEqual(actual, expected, message_opt);

        assert.strictEqual = function strictEqual(actual, expected, message) {
          if (actual !== expected) {
            fail(actual, expected, message, '===', assert.strictEqual);
          }
        };

        // 10. The strict non-equality assertion tests for strict inequality, as
        // determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

        assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
          if (actual === expected) {
            fail(actual, expected, message, '!==', assert.notStrictEqual);
          }
        };

        function expectedException(actual, expected) {
          if (!actual || !expected) {
            return false;
          }

          if (Object.prototype.toString.call(expected) == '[object RegExp]') {
            return expected.test(actual);
          }

          try {
            if (actual instanceof expected) {
              return true;
            }
          } catch (e) {
            // Ignore.  The instanceof check doesn't work for arrow functions.
          }

          if (Error.isPrototypeOf(expected)) {
            return false;
          }

          return expected.call({}, actual) === true;
        }

        function _tryBlock(block) {
          var error;
          try {
            block();
          } catch (e) {
            error = e;
          }
          return error;
        }

        function _throws(shouldThrow, block, expected, message) {
          var actual;

          if (typeof block !== 'function') {
            throw new TypeError('"block" argument must be a function');
          }

          if (typeof expected === 'string') {
            message = expected;
            expected = null;
          }

          actual = _tryBlock(block);

          message = (expected && expected.name ? ' (' + expected.name + ').' : '.') + (message ? ' ' + message : '.');

          if (shouldThrow && !actual) {
            fail(actual, expected, 'Missing expected exception' + message);
          }

          var userProvidedMessage = typeof message === 'string';
          var isUnwantedException = !shouldThrow && util.isError(actual);
          var isUnexpectedException = !shouldThrow && actual && !expected;

          if (isUnwantedException && userProvidedMessage && expectedException(actual, expected) || isUnexpectedException) {
            fail(actual, expected, 'Got unwanted exception' + message);
          }

          if (shouldThrow && actual && expected && !expectedException(actual, expected) || !shouldThrow && actual) {
            throw actual;
          }
        }

        // 11. Expected to throw an error:
        // assert.throws(block, Error_opt, message_opt);

        assert.throws = function (block, /*optional*/error, /*optional*/message) {
          _throws(true, block, error, message);
        };

        // EXTENSION! This is annoying to write outside this module.
        assert.doesNotThrow = function (block, /*optional*/error, /*optional*/message) {
          _throws(false, block, error, message);
        };

        assert.ifError = function (err) {
          if (err) throw err;
        };

        var objectKeys = Object.keys || function (obj) {
          var keys = [];
          for (var key in obj) {
            if (hasOwn.call(obj, key)) keys.push(key);
          }
          return keys;
        };
      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, { "util/": 32 }], 17: [function (require, module, exports) {
      'use strict';

      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;

      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }

      revLookup['-'.charCodeAt(0)] = 62;
      revLookup['_'.charCodeAt(0)] = 63;

      function placeHoldersCount(b64) {
        var len = b64.length;
        if (len % 4 > 0) {
          throw new Error('Invalid string. Length must be a multiple of 4');
        }

        // the number of equal signs (place holders)
        // if there are two placeholders, than the two characters before it
        // represent one byte
        // if there is only one, then the three characters before it represent 2 bytes
        // this is just a cheap hack to not do indexOf twice
        return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;
      }

      function byteLength(b64) {
        // base64 is 4/3 + up to two characters of the original data
        return b64.length * 3 / 4 - placeHoldersCount(b64);
      }

      function toByteArray(b64) {
        var i, j, l, tmp, placeHolders, arr;
        var len = b64.length;
        placeHolders = placeHoldersCount(b64);

        arr = new Arr(len * 3 / 4 - placeHolders);

        // if there are placeholders, only get up to the last complete 4 chars
        l = placeHolders > 0 ? len - 4 : len;

        var L = 0;

        for (i = 0, j = 0; i < l; i += 4, j += 3) {
          tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
          arr[L++] = tmp >> 16 & 0xFF;
          arr[L++] = tmp >> 8 & 0xFF;
          arr[L++] = tmp & 0xFF;
        }

        if (placeHolders === 2) {
          tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
          arr[L++] = tmp & 0xFF;
        } else if (placeHolders === 1) {
          tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
          arr[L++] = tmp >> 8 & 0xFF;
          arr[L++] = tmp & 0xFF;
        }

        return arr;
      }

      function tripletToBase64(num) {
        return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
      }

      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i = start; i < end; i += 3) {
          tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
          output.push(tripletToBase64(tmp));
        }
        return output.join('');
      }

      function fromByteArray(uint8) {
        var tmp;
        var len = uint8.length;
        var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
        var output = '';
        var parts = [];
        var maxChunkLength = 16383; // must be multiple of 3

        // go through the array every three bytes, we'll deal with trailing stuff later
        for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
          parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
        }

        // pad the end with zeros, but make sure to not forget the extra bytes
        if (extraBytes === 1) {
          tmp = uint8[len - 1];
          output += lookup[tmp >> 2];
          output += lookup[tmp << 4 & 0x3F];
          output += '==';
        } else if (extraBytes === 2) {
          tmp = (uint8[len - 2] << 8) + uint8[len - 1];
          output += lookup[tmp >> 10];
          output += lookup[tmp >> 4 & 0x3F];
          output += lookup[tmp << 2 & 0x3F];
          output += '=';
        }

        parts.push(output);

        return parts.join('');
      }
    }, {}], 18: [function (require, module, exports) {
      /*!
       * The buffer module from node.js, for the browser.
       *
       * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
       * @license  MIT
       */
      /* eslint-disable no-proto */

      'use strict';

      var base64 = require('base64-js');
      var ieee754 = require('ieee754');

      exports.Buffer = Buffer;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;

      var K_MAX_LENGTH = 0x7fffffff;
      exports.kMaxLength = K_MAX_LENGTH;

      /**
       * If `Buffer.TYPED_ARRAY_SUPPORT`:
       *   === true    Use Uint8Array implementation (fastest)
       *   === false   Print warning and recommend using `buffer` v4.x which has an Object
       *               implementation (most compatible, even IE6)
       *
       * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
       * Opera 11.6+, iOS 4.2+.
       *
       * We report that the browser does not support typed arrays if the are not subclassable
       * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
       * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
       * for __proto__ and has a buggy typed array implementation.
       */
      Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

      if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
      }

      function typedArraySupport() {
        // Can typed array instances can be augmented?
        try {
          var arr = new Uint8Array(1);
          arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function foo() {
              return 42;
            } };
          return arr.foo() === 42;
        } catch (e) {
          return false;
        }
      }

      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('Invalid typed array length');
        }
        // Return an augmented `Uint8Array` instance
        var buf = new Uint8Array(length);
        buf.__proto__ = Buffer.prototype;
        return buf;
      }

      /**
       * The Buffer constructor returns instances of `Uint8Array` that have their
       * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
       * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
       * and the `Uint8Array` methods. Square bracket notation works as expected -- it
       * returns a single octet.
       *
       * The `Uint8Array` prototype remains unmodified.
       */

      function Buffer(arg, encodingOrOffset, length) {
        // Common case.
        if (typeof arg === 'number') {
          if (typeof encodingOrOffset === 'string') {
            throw new Error('If encoding is specified then the first argument must be a string');
          }
          return allocUnsafe(arg);
        }
        return from(arg, encodingOrOffset, length);
      }

      // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
      if (typeof Symbol !== 'undefined' && Symbol.species && Buffer[Symbol.species] === Buffer) {
        Object.defineProperty(Buffer, Symbol.species, {
          value: null,
          configurable: true,
          enumerable: false,
          writable: false
        });
      }

      Buffer.poolSize = 8192; // not used by this implementation

      function from(value, encodingOrOffset, length) {
        if (typeof value === 'number') {
          throw new TypeError('"value" argument must not be a number');
        }

        if (value instanceof ArrayBuffer) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }

        if (typeof value === 'string') {
          return fromString(value, encodingOrOffset);
        }

        return fromObject(value);
      }

      /**
       * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
       * if value is a number.
       * Buffer.from(str[, encoding])
       * Buffer.from(array)
       * Buffer.from(buffer)
       * Buffer.from(arrayBuffer[, byteOffset[, length]])
       **/
      Buffer.from = function (value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length);
      };

      // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
      // https://github.com/feross/buffer/pull/148
      Buffer.prototype.__proto__ = Uint8Array.prototype;
      Buffer.__proto__ = Uint8Array;

      function assertSize(size) {
        if (typeof size !== 'number') {
          throw new TypeError('"size" argument must be a number');
        } else if (size < 0) {
          throw new RangeError('"size" argument must not be negative');
        }
      }

      function alloc(size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(size);
        }
        if (fill !== undefined) {
          // Only pay attention to encoding if it's a string. This
          // prevents accidentally sending in a number that would
          // be interpretted as a start offset.
          return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
        }
        return createBuffer(size);
      }

      /**
       * Creates a new filled Buffer instance.
       * alloc(size[, fill[, encoding]])
       **/
      Buffer.alloc = function (size, fill, encoding) {
        return alloc(size, fill, encoding);
      };

      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }

      /**
       * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
       * */
      Buffer.allocUnsafe = function (size) {
        return allocUnsafe(size);
      };
      /**
       * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
       */
      Buffer.allocUnsafeSlow = function (size) {
        return allocUnsafe(size);
      };

      function fromString(string, encoding) {
        if (typeof encoding !== 'string' || encoding === '') {
          encoding = 'utf8';
        }

        if (!Buffer.isEncoding(encoding)) {
          throw new TypeError('"encoding" must be a valid string encoding');
        }

        var length = byteLength(string, encoding) | 0;
        var buf = createBuffer(length);

        var actual = buf.write(string, encoding);

        if (actual !== length) {
          // Writing a hex string, for example, that contains invalid characters will
          // cause everything after the first invalid character to be ignored. (e.g.
          // 'abxxcd' will be treated as 'ab')
          buf = buf.slice(0, actual);
        }

        return buf;
      }

      function fromArrayLike(array) {
        var length = array.length < 0 ? 0 : checked(array.length) | 0;
        var buf = createBuffer(length);
        for (var i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255;
        }
        return buf;
      }

      function fromArrayBuffer(array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('\'offset\' is out of bounds');
        }

        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('\'length\' is out of bounds');
        }

        var buf;
        if (byteOffset === undefined && length === undefined) {
          buf = new Uint8Array(array);
        } else if (length === undefined) {
          buf = new Uint8Array(array, byteOffset);
        } else {
          buf = new Uint8Array(array, byteOffset, length);
        }

        // Return an augmented `Uint8Array` instance
        buf.__proto__ = Buffer.prototype;
        return buf;
      }

      function fromObject(obj) {
        if (Buffer.isBuffer(obj)) {
          var len = checked(obj.length) | 0;
          var buf = createBuffer(len);

          if (buf.length === 0) {
            return buf;
          }

          obj.copy(buf, 0, 0, len);
          return buf;
        }

        if (obj) {
          if (isArrayBufferView(obj) || 'length' in obj) {
            if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
              return createBuffer(0);
            }
            return fromArrayLike(obj);
          }

          if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
            return fromArrayLike(obj.data);
          }
        }

        throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
      }

      function checked(length) {
        // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
        // length is NaN (which is otherwise coerced to zero.)
        if (length >= K_MAX_LENGTH) {
          throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
        }
        return length | 0;
      }

      function SlowBuffer(length) {
        if (+length != length) {
          // eslint-disable-line eqeqeq
          length = 0;
        }
        return Buffer.alloc(+length);
      }

      Buffer.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true;
      };

      Buffer.compare = function compare(a, b) {
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
          throw new TypeError('Arguments must be Buffers');
        }

        if (a === b) return 0;

        var x = a.length;
        var y = b.length;

        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }

        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };

      Buffer.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case 'hex':
          case 'utf8':
          case 'utf-8':
          case 'ascii':
          case 'latin1':
          case 'binary':
          case 'base64':
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return true;
          default:
            return false;
        }
      };

      Buffer.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }

        if (list.length === 0) {
          return Buffer.alloc(0);
        }

        var i;
        if (length === undefined) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }

        var buffer = Buffer.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (!Buffer.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          }
          buf.copy(buffer, pos);
          pos += buf.length;
        }
        return buffer;
      };

      function byteLength(string, encoding) {
        if (Buffer.isBuffer(string)) {
          return string.length;
        }
        if (isArrayBufferView(string) || string instanceof ArrayBuffer) {
          return string.byteLength;
        }
        if (typeof string !== 'string') {
          string = '' + string;
        }

        var len = string.length;
        if (len === 0) return 0;

        // Use a for loop to avoid recursion
        var loweredCase = false;
        for (;;) {
          switch (encoding) {
            case 'ascii':
            case 'latin1':
            case 'binary':
              return len;
            case 'utf8':
            case 'utf-8':
            case undefined:
              return utf8ToBytes(string).length;
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return len * 2;
            case 'hex':
              return len >>> 1;
            case 'base64':
              return base64ToBytes(string).length;
            default:
              if (loweredCase) return utf8ToBytes(string).length; // assume utf8
              encoding = ('' + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer.byteLength = byteLength;

      function slowToString(encoding, start, end) {
        var loweredCase = false;

        // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
        // property of a typed array.

        // This behaves neither like String nor Uint8Array in that we set start/end
        // to their upper/lower bounds if the value passed is out of range.
        // undefined is handled specially as per ECMA-262 6th Edition,
        // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
        if (start === undefined || start < 0) {
          start = 0;
        }
        // Return early if start > this.length. Done here to prevent potential uint32
        // coercion fail below.
        if (start > this.length) {
          return '';
        }

        if (end === undefined || end > this.length) {
          end = this.length;
        }

        if (end <= 0) {
          return '';
        }

        // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
        end >>>= 0;
        start >>>= 0;

        if (end <= start) {
          return '';
        }

        if (!encoding) encoding = 'utf8';

        while (true) {
          switch (encoding) {
            case 'hex':
              return hexSlice(this, start, end);

            case 'utf8':
            case 'utf-8':
              return utf8Slice(this, start, end);

            case 'ascii':
              return asciiSlice(this, start, end);

            case 'latin1':
            case 'binary':
              return latin1Slice(this, start, end);

            case 'base64':
              return base64Slice(this, start, end);

            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return utf16leSlice(this, start, end);

            default:
              if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
              encoding = (encoding + '').toLowerCase();
              loweredCase = true;
          }
        }
      }

      // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
      // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
      // reliably in a browserify context because there could be multiple different
      // copies of the 'buffer' package in use. This method works even for Buffer
      // instances that were created from another copy of the `buffer` package.
      // See: https://github.com/feross/buffer/issues/154
      Buffer.prototype._isBuffer = true;

      function swap(b, n, m) {
        var i = b[n];
        b[n] = b[m];
        b[m] = i;
      }

      Buffer.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 16-bits');
        }
        for (var i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };

      Buffer.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 32-bits');
        }
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };

      Buffer.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError('Buffer size must be a multiple of 64-bits');
        }
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };

      Buffer.prototype.toString = function toString() {
        var length = this.length;
        if (length === 0) return '';
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };

      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
        if (this === b) return true;
        return Buffer.compare(this, b) === 0;
      };

      Buffer.prototype.inspect = function inspect() {
        var str = '';
        var max = exports.INSPECT_MAX_BYTES;
        if (this.length > 0) {
          str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
          if (this.length > max) str += ' ... ';
        }
        return '<Buffer ' + str + '>';
      };

      Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (!Buffer.isBuffer(target)) {
          throw new TypeError('Argument must be a Buffer');
        }

        if (start === undefined) {
          start = 0;
        }
        if (end === undefined) {
          end = target ? target.length : 0;
        }
        if (thisStart === undefined) {
          thisStart = 0;
        }
        if (thisEnd === undefined) {
          thisEnd = this.length;
        }

        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError('out of range index');
        }

        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }

        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;

        if (this === target) return 0;

        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);

        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);

        for (var i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }

        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };

      // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
      // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
      //
      // Arguments:
      // - buffer - a Buffer to search
      // - val - a string, Buffer, or number
      // - byteOffset - an index into `buffer`; will be clamped to an int32
      // - encoding - an optional encoding, relevant is val is a string
      // - dir - true for indexOf, false for lastIndexOf
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        // Empty buffer means no match
        if (buffer.length === 0) return -1;

        // Normalize byteOffset
        if (typeof byteOffset === 'string') {
          encoding = byteOffset;
          byteOffset = 0;
        } else if (byteOffset > 0x7fffffff) {
          byteOffset = 0x7fffffff;
        } else if (byteOffset < -0x80000000) {
          byteOffset = -0x80000000;
        }
        byteOffset = +byteOffset; // Coerce to Number.
        if (numberIsNaN(byteOffset)) {
          // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
          byteOffset = dir ? 0 : buffer.length - 1;
        }

        // Normalize byteOffset: negative offsets start from the end of the buffer
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1;else byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0;else return -1;
        }

        // Normalize val
        if (typeof val === 'string') {
          val = Buffer.from(val, encoding);
        }

        // Finally, search either indexOf (if dir is true) or lastIndexOf
        if (Buffer.isBuffer(val)) {
          // Special case: looking for empty string/buffer always fails
          if (val.length === 0) {
            return -1;
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        } else if (typeof val === 'number') {
          val = val & 0xFF; // Search for a byte value [0-255]
          if (typeof Uint8Array.prototype.indexOf === 'function') {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
        }

        throw new TypeError('val must be string, number or Buffer');
      }

      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        var indexSize = 1;
        var arrLength = arr.length;
        var valLength = val.length;

        if (encoding !== undefined) {
          encoding = String(encoding).toLowerCase();
          if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
            if (arr.length < 2 || val.length < 2) {
              return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }

        function read(buf, i) {
          if (indexSize === 1) {
            return buf[i];
          } else {
            return buf.readUInt16BE(i * indexSize);
          }
        }

        var i;
        if (dir) {
          var foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }

        return -1;
      }

      Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };

      Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };

      Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };

      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        var remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }

        // must be an even number of digits
        var strLen = string.length;
        if (strLen % 2 !== 0) throw new TypeError('Invalid hex string');

        if (length > strLen / 2) {
          length = strLen / 2;
        }
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }

      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }

      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }

      function latin1Write(buf, string, offset, length) {
        return asciiWrite(buf, string, offset, length);
      }

      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }

      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }

      Buffer.prototype.write = function write(string, offset, length, encoding) {
        // Buffer#write(string)
        if (offset === undefined) {
          encoding = 'utf8';
          length = this.length;
          offset = 0;
          // Buffer#write(string, encoding)
        } else if (length === undefined && typeof offset === 'string') {
          encoding = offset;
          length = this.length;
          offset = 0;
          // Buffer#write(string, offset[, length][, encoding])
        } else if (isFinite(offset)) {
          offset = offset >>> 0;
          if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === undefined) encoding = 'utf8';
          } else {
            encoding = length;
            length = undefined;
          }
        } else {
          throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
        }

        var remaining = this.length - offset;
        if (length === undefined || length > remaining) length = remaining;

        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError('Attempt to write outside buffer bounds');
        }

        if (!encoding) encoding = 'utf8';

        var loweredCase = false;
        for (;;) {
          switch (encoding) {
            case 'hex':
              return hexWrite(this, string, offset, length);

            case 'utf8':
            case 'utf-8':
              return utf8Write(this, string, offset, length);

            case 'ascii':
              return asciiWrite(this, string, offset, length);

            case 'latin1':
            case 'binary':
              return latin1Write(this, string, offset, length);

            case 'base64':
              // Warning: maxLength not taken into account in base64Write
              return base64Write(this, string, offset, length);

            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return ucs2Write(this, string, offset, length);

            default:
              if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
              encoding = ('' + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };

      Buffer.prototype.toJSON = function toJSON() {
        return {
          type: 'Buffer',
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };

      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf);
        } else {
          return base64.fromByteArray(buf.slice(start, end));
        }
      }

      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        var res = [];

        var i = start;
        while (i < end) {
          var firstByte = buf[i];
          var codePoint = null;
          var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;

            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 0x80) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
                  if (tempCodePoint > 0x7F) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
                  if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
                  if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                    codePoint = tempCodePoint;
                  }
                }
            }
          }

          if (codePoint === null) {
            // we did not generate a valid codePoint so insert a
            // replacement char (U+FFFD) and advance only 1 byte
            codePoint = 0xFFFD;
            bytesPerSequence = 1;
          } else if (codePoint > 0xFFFF) {
            // encode to utf16 (surrogate pair dance)
            codePoint -= 0x10000;
            res.push(codePoint >>> 10 & 0x3FF | 0xD800);
            codePoint = 0xDC00 | codePoint & 0x3FF;
          }

          res.push(codePoint);
          i += bytesPerSequence;
        }

        return decodeCodePointsArray(res);
      }

      // Based on http://stackoverflow.com/a/22747272/680742, the browser with
      // the lowest limit is Chrome, with 0x10000 args.
      // We go 1 magnitude less, for safety
      var MAX_ARGUMENTS_LENGTH = 0x1000;

      function decodeCodePointsArray(codePoints) {
        var len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
        }

        // Decode in chunks to avoid "call stack size exceeded".
        var res = '';
        var i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
        }
        return res;
      }

      function asciiSlice(buf, start, end) {
        var ret = '';
        end = Math.min(buf.length, end);

        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 0x7F);
        }
        return ret;
      }

      function latin1Slice(buf, start, end) {
        var ret = '';
        end = Math.min(buf.length, end);

        for (var i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }

      function hexSlice(buf, start, end) {
        var len = buf.length;

        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;

        var out = '';
        for (var i = start; i < end; ++i) {
          out += toHex(buf[i]);
        }
        return out;
      }

      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end);
        var res = '';
        for (var i = 0; i < bytes.length; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }

      Buffer.prototype.slice = function slice(start, end) {
        var len = this.length;
        start = ~~start;
        end = end === undefined ? len : ~~end;

        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }

        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }

        if (end < start) end = start;

        var newBuf = this.subarray(start, end);
        // Return an augmented `Uint8Array` instance
        newBuf.__proto__ = Buffer.prototype;
        return newBuf;
      };

      /*
       * Need to make sure that buffer isn't trying to write out of bounds.
       */
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
        if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
      }

      Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
        offset = offset >>> 0;
        byteLength = byteLength >>> 0;
        if (!noAssert) checkOffset(offset, byteLength, this.length);

        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 0x100)) {
          val += this[offset + i] * mul;
        }

        return val;
      };

      Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
        offset = offset >>> 0;
        byteLength = byteLength >>> 0;
        if (!noAssert) {
          checkOffset(offset, byteLength, this.length);
        }

        var val = this[offset + --byteLength];
        var mul = 1;
        while (byteLength > 0 && (mul *= 0x100)) {
          val += this[offset + --byteLength] * mul;
        }

        return val;
      };

      Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };

      Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };

      Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };

      Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);

        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
      };

      Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);

        return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };

      Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
        offset = offset >>> 0;
        byteLength = byteLength >>> 0;
        if (!noAssert) checkOffset(offset, byteLength, this.length);

        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 0x100)) {
          val += this[offset + i] * mul;
        }
        mul *= 0x80;

        if (val >= mul) val -= Math.pow(2, 8 * byteLength);

        return val;
      };

      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
        offset = offset >>> 0;
        byteLength = byteLength >>> 0;
        if (!noAssert) checkOffset(offset, byteLength, this.length);

        var i = byteLength;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 0x100)) {
          val += this[offset + --i] * mul;
        }
        mul *= 0x80;

        if (val >= mul) val -= Math.pow(2, 8 * byteLength);

        return val;
      };

      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 0x80)) return this[offset];
        return (0xff - this[offset] + 1) * -1;
      };

      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return val & 0x8000 ? val | 0xFFFF0000 : val;
      };

      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return val & 0x8000 ? val | 0xFFFF0000 : val;
      };

      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);

        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };

      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);

        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };

      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };

      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };

      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };

      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };

      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError('Index out of range');
      }

      Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength = byteLength >>> 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }

        var mul = 1;
        var i = 0;
        this[offset] = value & 0xFF;
        while (++i < byteLength && (mul *= 0x100)) {
          this[offset + i] = value / mul & 0xFF;
        }

        return offset + byteLength;
      };

      Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength = byteLength >>> 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }

        var i = byteLength - 1;
        var mul = 1;
        this[offset + i] = value & 0xFF;
        while (--i >= 0 && (mul *= 0x100)) {
          this[offset + i] = value / mul & 0xFF;
        }

        return offset + byteLength;
      };

      Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
        this[offset] = value & 0xff;
        return offset + 1;
      };

      Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
        this[offset] = value & 0xff;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };

      Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 0xff;
        return offset + 2;
      };

      Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 0xff;
        return offset + 4;
      };

      Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 0xff;
        return offset + 4;
      };

      Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);

          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }

        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = value & 0xFF;
        while (++i < byteLength && (mul *= 0x100)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 0xFF;
        }

        return offset + byteLength;
      };

      Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);

          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }

        var i = byteLength - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = value & 0xFF;
        while (--i >= 0 && (mul *= 0x100)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 0xFF;
        }

        return offset + byteLength;
      };

      Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
        if (value < 0) value = 0xff + value + 1;
        this[offset] = value & 0xff;
        return offset + 1;
      };

      Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
        this[offset] = value & 0xff;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };

      Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 0xff;
        return offset + 2;
      };

      Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
        this[offset] = value & 0xff;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
        return offset + 4;
      };

      Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
        if (value < 0) value = 0xffffffff + value + 1;
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 0xff;
        return offset + 4;
      };

      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError('Index out of range');
        if (offset < 0) throw new RangeError('Index out of range');
      }

      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }

      Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };

      Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };

      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }

      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };

      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };

      // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;

        // Copy 0 bytes; we're done
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;

        // Fatal error conditions
        if (targetStart < 0) {
          throw new RangeError('targetStart out of bounds');
        }
        if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds');
        if (end < 0) throw new RangeError('sourceEnd out of bounds');

        // Are we oob?
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }

        var len = end - start;
        var i;

        if (this === target && start < targetStart && targetStart < end) {
          // descending copy from end
          for (i = len - 1; i >= 0; --i) {
            target[i + targetStart] = this[i + start];
          }
        } else if (len < 1000) {
          // ascending copy from start
          for (i = 0; i < len; ++i) {
            target[i + targetStart] = this[i + start];
          }
        } else {
          Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
        }

        return len;
      };

      // Usage:
      //    buffer.fill(number[, offset[, end]])
      //    buffer.fill(buffer[, offset[, end]])
      //    buffer.fill(string[, offset[, end]][, encoding])
      Buffer.prototype.fill = function fill(val, start, end, encoding) {
        // Handle string cases:
        if (typeof val === 'string') {
          if (typeof start === 'string') {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === 'string') {
            encoding = end;
            end = this.length;
          }
          if (val.length === 1) {
            var code = val.charCodeAt(0);
            if (code < 256) {
              val = code;
            }
          }
          if (encoding !== undefined && typeof encoding !== 'string') {
            throw new TypeError('encoding must be a string');
          }
          if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
            throw new TypeError('Unknown encoding: ' + encoding);
          }
        } else if (typeof val === 'number') {
          val = val & 255;
        }

        // Invalid ranges are not set to a default, so can range check early.
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError('Out of range index');
        }

        if (end <= start) {
          return this;
        }

        start = start >>> 0;
        end = end === undefined ? this.length : end >>> 0;

        if (!val) val = 0;

        var i;
        if (typeof val === 'number') {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          var bytes = Buffer.isBuffer(val) ? val : new Buffer(val, encoding);
          var len = bytes.length;
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }

        return this;
      };

      // HELPER FUNCTIONS
      // ================

      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

      function base64clean(str) {
        // Node strips out invalid characters like \n and \t from the string, base64-js does not
        str = str.trim().replace(INVALID_BASE64_RE, '');
        // Node converts strings with length < 2 to ''
        if (str.length < 2) return '';
        // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
        while (str.length % 4 !== 0) {
          str = str + '=';
        }
        return str;
      }

      function toHex(n) {
        if (n < 16) return '0' + n.toString(16);
        return n.toString(16);
      }

      function utf8ToBytes(string, units) {
        units = units || Infinity;
        var codePoint;
        var length = string.length;
        var leadSurrogate = null;
        var bytes = [];

        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);

          // is surrogate component
          if (codePoint > 0xD7FF && codePoint < 0xE000) {
            // last char was a lead
            if (!leadSurrogate) {
              // no lead yet
              if (codePoint > 0xDBFF) {
                // unexpected trail
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                continue;
              } else if (i + 1 === length) {
                // unpaired lead
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                continue;
              }

              // valid lead
              leadSurrogate = codePoint;

              continue;
            }

            // 2 leads in a row
            if (codePoint < 0xDC00) {
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
              leadSurrogate = codePoint;
              continue;
            }

            // valid surrogate pair
            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
          } else if (leadSurrogate) {
            // valid bmp char, but last char was a lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          }

          leadSurrogate = null;

          // encode utf8
          if (codePoint < 0x80) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 0x800) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
          } else if (codePoint < 0x10000) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
          } else if (codePoint < 0x110000) {
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
          } else {
            throw new Error('Invalid code point');
          }
        }

        return bytes;
      }

      function asciiToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          // Node's code seems to be doing this and not & 0x7F..
          byteArray.push(str.charCodeAt(i) & 0xFF);
        }
        return byteArray;
      }

      function utf16leToBytes(str, units) {
        var c, hi, lo;
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;

          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }

        return byteArray;
      }

      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }

      function blitBuffer(src, dst, offset, length) {
        for (var i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }

      // Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
      function isArrayBufferView(obj) {
        return typeof ArrayBuffer.isView === 'function' && ArrayBuffer.isView(obj);
      }

      function numberIsNaN(obj) {
        return obj !== obj; // eslint-disable-line no-self-compare
      }
    }, { "base64-js": 17, "ieee754": 23 }], 19: [function (require, module, exports) {
      'use strict';

      module.exports = ClassList;

      var indexOf = require('component-indexof'),
          trim = require('trim'),
          arr = Array.prototype;

      /**
       * ClassList(elem) is kind of like Element#classList.
       *
       * @param {Element} elem
       * @return {ClassList}
       */
      function ClassList(elem) {
        if (!(this instanceof ClassList)) return new ClassList(elem);

        var classes = trim(elem.className).split(/\s+/),
            i;

        this._elem = elem;

        this.length = 0;

        for (i = 0; i < classes.length; i += 1) {
          if (classes[i]) arr.push.call(this, classes[i]);
        }
      }

      /**
       * add(class1 [, class2 [, ...]]) adds the given class(es) to the
       * element.
       *
       * @param {String} ...
       * @return {Context}
       */
      ClassList.prototype.add = function () {
        var name, i;

        for (i = 0; i < arguments.length; i += 1) {
          name = '' + arguments[i];

          if (indexOf(this, name) >= 0) continue;

          arr.push.call(this, name);
        }

        this._elem.className = this.toString();

        return this;
      };

      /**
       * remove(class1 [, class2 [, ...]]) removes the given class(es) from
       * the element.
       *
       * @param {String} ...
       * @return {Context}
       */
      ClassList.prototype.remove = function () {
        var index, name, i;

        for (i = 0; i < arguments.length; i += 1) {
          name = '' + arguments[i];
          index = indexOf(this, name);

          if (index < 0) continue;

          arr.splice.call(this, index, 1);
        }

        this._elem.className = this.toString();

        return this;
      };

      /**
       * contains(name) determines if the element has a given class.
       *
       * @param {String} name
       * @return {Boolean}
       */
      ClassList.prototype.contains = function (name) {
        name += '';
        return indexOf(this, name) >= 0;
      };

      /**
       * toggle(name [, force]) toggles a class. If force is a boolean,
       * this method is basically just an alias for add/remove.
       *
       * @param {String} name
       * @param {Boolean} force
       * @return {Context}
       */
      ClassList.prototype.toggle = function (name, force) {
        name += '';

        if (force === true) return this.add(name);
        if (force === false) return this.remove(name);

        return this[this.contains(name) ? 'remove' : 'add'](name);
      };

      /**
       * toString() returns the className of the element.
       *
       * @return {String}
       */
      ClassList.prototype.toString = function () {
        return arr.join.call(this, ' ');
      };
    }, { "component-indexof": 21, "trim": 29 }], 20: [function (require, module, exports) {

      /**
       * Expose `Emitter`.
       */

      if (typeof module !== 'undefined') {
        module.exports = Emitter;
      }

      /**
       * Initialize a new `Emitter`.
       *
       * @api public
       */

      function Emitter(obj) {
        if (obj) return mixin(obj);
      };

      /**
       * Mixin the emitter properties.
       *
       * @param {Object} obj
       * @return {Object}
       * @api private
       */

      function mixin(obj) {
        for (var key in Emitter.prototype) {
          obj[key] = Emitter.prototype[key];
        }
        return obj;
      }

      /**
       * Listen on the given `event` with `fn`.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
        this._callbacks = this._callbacks || {};
        (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
        return this;
      };

      /**
       * Adds an `event` listener that will be invoked a single
       * time then automatically removed.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.once = function (event, fn) {
        function on() {
          this.off(event, on);
          fn.apply(this, arguments);
        }

        on.fn = fn;
        this.on(event, on);
        return this;
      };

      /**
       * Remove the given callback for `event` or all
       * registered callbacks.
       *
       * @param {String} event
       * @param {Function} fn
       * @return {Emitter}
       * @api public
       */

      Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
        this._callbacks = this._callbacks || {};

        // all
        if (0 == arguments.length) {
          this._callbacks = {};
          return this;
        }

        // specific event
        var callbacks = this._callbacks['$' + event];
        if (!callbacks) return this;

        // remove all handlers
        if (1 == arguments.length) {
          delete this._callbacks['$' + event];
          return this;
        }

        // remove specific handler
        var cb;
        for (var i = 0; i < callbacks.length; i++) {
          cb = callbacks[i];
          if (cb === fn || cb.fn === fn) {
            callbacks.splice(i, 1);
            break;
          }
        }
        return this;
      };

      /**
       * Emit `event` with the given args.
       *
       * @param {String} event
       * @param {Mixed} ...
       * @return {Emitter}
       */

      Emitter.prototype.emit = function (event) {
        this._callbacks = this._callbacks || {};
        var args = [].slice.call(arguments, 1),
            callbacks = this._callbacks['$' + event];

        if (callbacks) {
          callbacks = callbacks.slice(0);
          for (var i = 0, len = callbacks.length; i < len; ++i) {
            callbacks[i].apply(this, args);
          }
        }

        return this;
      };

      /**
       * Return array of callbacks for `event`.
       *
       * @param {String} event
       * @return {Array}
       * @api public
       */

      Emitter.prototype.listeners = function (event) {
        this._callbacks = this._callbacks || {};
        return this._callbacks['$' + event] || [];
      };

      /**
       * Check if this emitter has `event` handlers.
       *
       * @param {String} event
       * @return {Boolean}
       * @api public
       */

      Emitter.prototype.hasListeners = function (event) {
        return !!this.listeners(event).length;
      };
    }, {}], 21: [function (require, module, exports) {
      module.exports = function (arr, obj) {
        if (arr.indexOf) return arr.indexOf(obj);
        for (var i = 0; i < arr.length; ++i) {
          if (arr[i] === obj) return i;
        }
        return -1;
      };
    }, {}], 22: [function (require, module, exports) {
      'use strict';

      var isObject = require('is-extendable');

      module.exports = function extend(o /*, objects*/) {
        if (!isObject(o)) {
          o = {};
        }

        var len = arguments.length;
        for (var i = 1; i < len; i++) {
          var obj = arguments[i];

          if (isObject(obj)) {
            assign(o, obj);
          }
        }
        return o;
      };

      function assign(a, b) {
        for (var key in b) {
          if (hasOwn(b, key)) {
            a[key] = b[key];
          }
        }
      }

      /**
       * Returns true if the given `key` is an own property of `obj`.
       */

      function hasOwn(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
      }
    }, { "is-extendable": 24 }], 23: [function (require, module, exports) {
      exports.read = function (buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];

        i += d;

        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };

      exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;

        value = Math.abs(value);

        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }

          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }

        for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

        buffer[offset + i - d] |= s * 128;
      };
    }, {}], 24: [function (require, module, exports) {
      /*!
       * is-extendable <https://github.com/jonschlinkert/is-extendable>
       *
       * Copyright (c) 2015, Jon Schlinkert.
       * Licensed under the MIT License.
       */

      'use strict';

      module.exports = function isExtendable(val) {
        return typeof val !== 'undefined' && val !== null && ((typeof val === "undefined" ? "undefined" : _typeof(val)) === 'object' || typeof val === 'function');
      };
    }, {}], 25: [function (require, module, exports) {
      'use strict';

      /**
       * Creates the region
       * @param {Object} options The following configuration options:
       * @option {String} `ariaLive`: "polite" or "assertive" (defaults to "polite")
       * @option {String} `role`: "status", "alert", or "log" (defaults to "log")
       * @option {String} `ariaRelevant`: "additions", "removals", "text", "all",
       *         or "additions text" (defaults to "additions")
       * @option {String} `ariaAtomic`: "true" or "false" (defaults to "false")
       */

      function LiveRegion(options) {
        this.region = document.createElement('div');
        this.options = options || {};
        // set attrs / styles
        this.configure();
        // append it
        document.body.appendChild(this.region);
      }

      /**
       * configure
       * Sets attributes and offscreens the region
       */

      LiveRegion.prototype.configure = function () {
        var opts = this.options;
        var region = this.region;
        // set attributes
        region.setAttribute('aria-live', opts.ariaLive || 'polite');
        region.setAttribute('role', opts.role || 'log');
        region.setAttribute('aria-relevant', opts.ariaRelevant || 'additions');
        region.setAttribute('aria-atomic', opts.ariaAtomic || 'false');

        // offscreen it
        this.region.style.position = 'absolute';
        this.region.style.width = '1px';
        this.region.style.height = '1px';
        this.region.style.marginTop = '-1px';
        this.region.style.clip = 'rect(1px, 1px, 1px, 1px)';
        this.region.style.overflow = 'hidden';
      };

      /**
       * announce
       * Creates a live region announcement
       * @param {String} msg The message to announce
       * @param {Number} `expire`: The number of ms before removing the announcement
       * node from the live region. This prevents the region from getting full useless
       * nodes (defaults to 7000)
       */

      LiveRegion.prototype.announce = function (msg, expire) {
        var announcement = document.createElement('div');
        announcement.innerHTML = msg;
        // add it to the offscreen region
        this.region.appendChild(announcement);

        if (expire || typeof expire === 'undefined') {
          setTimeout(function () {
            this.region.removeChild(announcement);
          }.bind(this), expire || 7e3); // defaults to 7 seconds
        }
      };

      /**
       * Expose LiveRegion
       */

      if (typeof module !== 'undefined') {
        module.exports = LiveRegion;
      }
    }, {}], 26: [function (require, module, exports) {
      // shim for using process in browser
      var process = module.exports = {};

      // cached from whatever global is present so that test runners that stub it
      // don't break things.  But we need to wrap it in a try catch in case it is
      // wrapped in strict mode code which doesn't define any globals.  It's inside a
      // function because try/catches deoptimize in certain engines.

      var cachedSetTimeout;
      var cachedClearTimeout;

      function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
      }
      function defaultClearTimeout() {
        throw new Error('clearTimeout has not been defined');
      }
      (function () {
        try {
          if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
          } else {
            cachedSetTimeout = defaultSetTimout;
          }
        } catch (e) {
          cachedSetTimeout = defaultSetTimout;
        }
        try {
          if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
          } else {
            cachedClearTimeout = defaultClearTimeout;
          }
        } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
        }
      })();
      function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
        }
        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
        } catch (e) {
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
          } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
          }
        }
      }
      function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
        }
        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
        } catch (e) {
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
          } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
          }
        }
      }
      var queue = [];
      var draining = false;
      var currentQueue;
      var queueIndex = -1;

      function cleanUpNextTick() {
        if (!draining || !currentQueue) {
          return;
        }
        draining = false;
        if (currentQueue.length) {
          queue = currentQueue.concat(queue);
        } else {
          queueIndex = -1;
        }
        if (queue.length) {
          drainQueue();
        }
      }

      function drainQueue() {
        if (draining) {
          return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while (len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
            if (currentQueue) {
              currentQueue[queueIndex].run();
            }
          }
          queueIndex = -1;
          len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
      }

      process.nextTick = function (fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
        }
      };

      // v8 likes predictible objects
      function Item(fun, array) {
        this.fun = fun;
        this.array = array;
      }
      Item.prototype.run = function () {
        this.fun.apply(null, this.array);
      };
      process.title = 'browser';
      process.browser = true;
      process.env = {};
      process.argv = [];
      process.version = ''; // empty string to avoid regexp issues
      process.versions = {};

      function noop() {}

      process.on = noop;
      process.addListener = noop;
      process.once = noop;
      process.off = noop;
      process.removeListener = noop;
      process.removeAllListeners = noop;
      process.emit = noop;
      process.prependListener = noop;
      process.prependOnceListener = noop;

      process.listeners = function (name) {
        return [];
      };

      process.binding = function (name) {
        throw new Error('process.binding is not supported');
      };

      process.cwd = function () {
        return '/';
      };
      process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
      };
      process.umask = function () {
        return 0;
      };
    }, {}], 27: [function (require, module, exports) {
      (function (Buffer) {

        var assert = require('assert');

        var base62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var base36 = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var base10 = '0123456789';

        exports = module.exports = create(base62);
        exports.base62 = exports;
        exports.base36 = create(base36);
        exports.base10 = create(base10);

        exports.create = create;

        function create(chars) {
          assert(typeof chars === 'string', 'the list of characters must be a string!');
          var length = Buffer.byteLength(chars);
          return function rndm(len) {
            len = len || 10;
            assert(typeof len === 'number' && len >= 0, 'the length of the random string must be a number!');
            var salt = '';
            for (var i = 0; i < len; i++) {
              salt += chars[Math.floor(length * Math.random())];
            }return salt;
          };
        }
      }).call(this, require("buffer").Buffer);
    }, { "assert": 16, "buffer": 18 }], 28: [function (require, module, exports) {
      !function (e, t) {
        "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) ? exports.scrolltoElement = t() : e.scrolltoElement = t();
      }(this, function () {
        return function (e) {
          function t(r) {
            if (n[r]) return n[r].exports;var o = n[r] = { i: r, l: !1, exports: {} };return e[r].call(o.exports, o, o.exports, t), o.l = !0, o.exports;
          }var n = {};return t.m = e, t.c = n, t.i = function (e) {
            return e;
          }, t.d = function (e, n, r) {
            t.o(e, n) || Object.defineProperty(e, n, { configurable: !1, enumerable: !0, get: r });
          }, t.n = function (e) {
            var n = e && e.__esModule ? function () {
              return e.default;
            } : function () {
              return e;
            };return t.d(n, "a", n), n;
          }, t.o = function (e, t) {
            return Object.prototype.hasOwnProperty.call(e, t);
          }, t.p = "", t(t.s = 1);
        }([function (e, t, n) {
          "use strict";
          function r(e) {
            return e && e.__esModule ? e : { default: e };
          }function o(e) {
            if (Array.isArray(e)) {
              for (var t = 0, n = Array(e.length); t < e.length; t++) {
                n[t] = e[t];
              }return n;
            }return Array.from(e);
          }function i() {}function u(e) {
            function t(e) {
              null === h && (h = e);var r = e - h,
                  o = u(r / n) * w;l.scrollTop = Math.round(d + o), r < n ? (0, a.default)(t) : c();
            }var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 100,
                r = 0,
                u = void 0,
                c = void 0;if ((0, s.isElement)(e)) u = f.default.apply(void 0, m), c = i;else {
              if (!(0, s.isObject)(e)) throw new TypeError("The first argument must be HTMLElement or Object.");if (!(0, s.isElement)(e.element)) throw new TypeError("`element` must be HTMLElement.");r = (0, s.isNumeric)(e.offset) ? e.offset : 0, u = (0, s.isArray)(e.bezier) && 4 === e.bezier.length ? f.default.apply(void 0, o(e.bezier)) : f.default.apply(void 0, m), n = e.duration, c = (0, s.isFunction)(e.then) ? e.then : i, e = e.element;
            }(!(0, s.isNumeric)(n) || n < 0) && (n = 100);var l = (0, p.default)(e),
                d = l.scrollTop,
                y = l.offsetTop,
                h = null,
                v = void 0;v = "BODY" === l.nodeName ? e.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || document.body.scrollTop) - y : e.offsetTop - y;var w = v - d + r;(0, a.default)(t);
          }Object.defineProperty(t, "__esModule", { value: !0 });var c = n(4),
              f = r(c),
              l = n(7),
              a = r(l),
              s = n(2),
              d = n(3),
              p = r(d),
              m = [.19, 1, .22, 1];t.default = u;
        }, function (e, t, n) {
          "use strict";
          var r = n(0),
              o = function (e) {
            return e && e.__esModule ? e : { default: e };
          }(r);e.exports = o.default;
        }, function (e, t, n) {
          "use strict";
          function r(e) {
            return Object.prototype.toString.call(e);
          }function o(e) {
            return "[object Object]" === r(e);
          }function i(e) {
            return null != e && "[object Array]" === r(e);
          }function u(e) {
            return !isNaN(parseFloat(e)) && isFinite(e);
          }function c(e) {
            return u(e) && e >= 0;
          }function f(e) {
            return null != e && "[object Function]" === r(e);
          }function l(e) {
            return "object" === a(window.HTMLElement) ? e instanceof window.HTMLElement : !!e && "object" === (void 0 === e ? "undefined" : a(e)) && null !== e && 1 === e.nodeType && "string" == typeof e.nodeName;
          }Object.defineProperty(t, "__esModule", { value: !0 });var a = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (e) {
            return typeof e === "undefined" ? "undefined" : _typeof(e);
          } : function (e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e === "undefined" ? "undefined" : _typeof(e);
          };t.isObject = o, t.isArray = i, t.isNumeric = u, t.isPositive = c, t.isFunction = f, t.isElement = l;
        }, function (e, t, n) {
          "use strict";
          function r(e) {
            var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [],
                n = e.parentNode;return null === n || "HTML" === n.nodeName ? t : r(n, t.concat(n));
          }function o(e, t) {
            return window.getComputedStyle(e, null).getPropertyValue(t);
          }function i(e) {
            return o(e, "overflow") + o(e, "overflow-y");
          }function u(e) {
            if (1 === e.nodeType) return f.test(i(e)) && e.scrollHeight > e.clientHeight;
          }function c(e) {
            for (var t = r(e), n = document.body, o = 0, i = t.length; o < i; o++) {
              if (u(t[o])) {
                n = t[o];break;
              }
            }return n;
          }Object.defineProperty(t, "__esModule", { value: !0 });var f = /(auto|scroll)/;t.default = c;
        }, function (e, t) {
          function n(e, t) {
            return 1 - 3 * t + 3 * e;
          }function r(e, t) {
            return 3 * t - 6 * e;
          }function o(e) {
            return 3 * e;
          }function i(e, t, i) {
            return ((n(t, i) * e + r(t, i)) * e + o(t)) * e;
          }function u(e, t, i) {
            return 3 * n(t, i) * e * e + 2 * r(t, i) * e + o(t);
          }function c(e, t, n, r, o) {
            var u,
                c,
                f = 0;do {
              c = t + (n - t) / 2, u = i(c, r, o) - e, u > 0 ? n = c : t = c;
            } while (Math.abs(u) > a && ++f < s);return c;
          }function f(e, t, n, r) {
            for (var o = 0; o < l; ++o) {
              var c = u(t, n, r);if (0 === c) return t;t -= (i(t, n, r) - e) / c;
            }return t;
          }var l = 4,
              a = 1e-7,
              s = 10,
              d = 11,
              p = 1 / (d - 1),
              m = "function" == typeof Float32Array;e.exports = function (e, t, n, r) {
            function o(t) {
              for (var r = 0, o = 1, i = d - 1; o !== i && l[o] <= t; ++o) {
                r += p;
              }--o;var a = (t - l[o]) / (l[o + 1] - l[o]),
                  s = r + a * p,
                  m = u(s, e, n);return m >= .001 ? f(t, s, e, n) : 0 === m ? s : c(t, r, r + p, e, n);
            }if (!(0 <= e && e <= 1 && 0 <= n && n <= 1)) throw new Error("bezier x values must be in [0, 1] range");var l = m ? new Float32Array(d) : new Array(d);if (e !== t || n !== r) for (var a = 0; a < d; ++a) {
              l[a] = i(a * p, e, n);
            }return function (u) {
              return e === t && n === r ? u : 0 === u ? 0 : 1 === u ? 1 : i(o(u), t, r);
            };
          };
        }, function (e, t, n) {
          (function (t) {
            (function () {
              var n, r, o, i, u, c;"undefined" != typeof performance && null !== performance && performance.now ? e.exports = function () {
                return performance.now();
              } : void 0 !== t && null !== t && t.hrtime ? (e.exports = function () {
                return (n() - u) / 1e6;
              }, r = t.hrtime, n = function n() {
                var e;return e = r(), 1e9 * e[0] + e[1];
              }, i = n(), c = 1e9 * t.uptime(), u = i - c) : Date.now ? (e.exports = function () {
                return Date.now() - o;
              }, o = Date.now()) : (e.exports = function () {
                return new Date().getTime() - o;
              }, o = new Date().getTime());
            }).call(this);
          }).call(t, n(6));
        }, function (e, t) {
          function n() {
            throw new Error("setTimeout has not been defined");
          }function r() {
            throw new Error("clearTimeout has not been defined");
          }function o(e) {
            if (a === setTimeout) return setTimeout(e, 0);if ((a === n || !a) && setTimeout) return a = setTimeout, setTimeout(e, 0);try {
              return a(e, 0);
            } catch (t) {
              try {
                return a.call(null, e, 0);
              } catch (t) {
                return a.call(this, e, 0);
              }
            }
          }function i(e) {
            if (s === clearTimeout) return clearTimeout(e);if ((s === r || !s) && clearTimeout) return s = clearTimeout, clearTimeout(e);try {
              return s(e);
            } catch (t) {
              try {
                return s.call(null, e);
              } catch (t) {
                return s.call(this, e);
              }
            }
          }function u() {
            y && p && (y = !1, p.length ? m = p.concat(m) : h = -1, m.length && c());
          }function c() {
            if (!y) {
              var e = o(u);y = !0;for (var t = m.length; t;) {
                for (p = m, m = []; ++h < t;) {
                  p && p[h].run();
                }h = -1, t = m.length;
              }p = null, y = !1, i(e);
            }
          }function f(e, t) {
            this.fun = e, this.array = t;
          }function l() {}var a,
              s,
              d = e.exports = {};!function () {
            try {
              a = "function" == typeof setTimeout ? setTimeout : n;
            } catch (e) {
              a = n;
            }try {
              s = "function" == typeof clearTimeout ? clearTimeout : r;
            } catch (e) {
              s = r;
            }
          }();var p,
              m = [],
              y = !1,
              h = -1;d.nextTick = function (e) {
            var t = new Array(arguments.length - 1);if (arguments.length > 1) for (var n = 1; n < arguments.length; n++) {
              t[n - 1] = arguments[n];
            }m.push(new f(e, t)), 1 !== m.length || y || o(c);
          }, f.prototype.run = function () {
            this.fun.apply(null, this.array);
          }, d.title = "browser", d.browser = !0, d.env = {}, d.argv = [], d.version = "", d.versions = {}, d.on = l, d.addListener = l, d.once = l, d.off = l, d.removeListener = l, d.removeAllListeners = l, d.emit = l, d.binding = function (e) {
            throw new Error("process.binding is not supported");
          }, d.cwd = function () {
            return "/";
          }, d.chdir = function (e) {
            throw new Error("process.chdir is not supported");
          }, d.umask = function () {
            return 0;
          };
        }, function (e, t, n) {
          (function (t) {
            for (var r = n(5), o = "undefined" == typeof window ? t : window, i = ["moz", "webkit"], u = "AnimationFrame", c = o["request" + u], f = o["cancel" + u] || o["cancelRequest" + u], l = 0; !c && l < i.length; l++) {
              c = o[i[l] + "Request" + u], f = o[i[l] + "Cancel" + u] || o[i[l] + "CancelRequest" + u];
            }if (!c || !f) {
              var a = 0,
                  s = 0,
                  d = [];c = function c(e) {
                if (0 === d.length) {
                  var t = r(),
                      n = Math.max(0, 1e3 / 60 - (t - a));a = n + t, setTimeout(function () {
                    var e = d.slice(0);d.length = 0;for (var t = 0; t < e.length; t++) {
                      if (!e[t].cancelled) try {
                        e[t].callback(a);
                      } catch (e) {
                        setTimeout(function () {
                          throw e;
                        }, 0);
                      }
                    }
                  }, Math.round(n));
                }return d.push({ handle: ++s, callback: e, cancelled: !1 }), s;
              }, f = function f(e) {
                for (var t = 0; t < d.length; t++) {
                  d[t].handle === e && (d[t].cancelled = !0);
                }
              };
            }e.exports = function (e) {
              return c.call(o, e);
            }, e.exports.cancel = function () {
              f.apply(o, arguments);
            }, e.exports.polyfill = function () {
              o.requestAnimationFrame = c, o.cancelAnimationFrame = f;
            };
          }).call(t, n(8));
        }, function (e, t) {
          var n;n = function () {
            return this;
          }();try {
            n = n || Function("return this")() || (0, eval)("this");
          } catch (e) {
            "object" == (typeof window === "undefined" ? "undefined" : _typeof(window)) && (n = window);
          }e.exports = n;
        }]);
      });
    }, {}], 29: [function (require, module, exports) {

      exports = module.exports = trim;

      function trim(str) {
        return str.replace(/^\s*|\s*$/g, '');
      }

      exports.left = function (str) {
        return str.replace(/^\s*/, '');
      };

      exports.right = function (str) {
        return str.replace(/\s*$/, '');
      };
    }, {}], 30: [function (require, module, exports) {
      if (typeof Object.create === 'function') {
        // implementation from standard node.js 'util' module
        module.exports = function inherits(ctor, superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        };
      } else {
        // old school shim for old browsers
        module.exports = function inherits(ctor, superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function TempCtor() {};
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        };
      }
    }, {}], 31: [function (require, module, exports) {
      module.exports = function isBuffer(arg) {
        return arg && (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && typeof arg.copy === 'function' && typeof arg.fill === 'function' && typeof arg.readUInt8 === 'function';
      };
    }, {}], 32: [function (require, module, exports) {
      (function (process, global) {
        // Copyright Joyent, Inc. and other Node contributors.
        //
        // Permission is hereby granted, free of charge, to any person obtaining a
        // copy of this software and associated documentation files (the
        // "Software"), to deal in the Software without restriction, including
        // without limitation the rights to use, copy, modify, merge, publish,
        // distribute, sublicense, and/or sell copies of the Software, and to permit
        // persons to whom the Software is furnished to do so, subject to the
        // following conditions:
        //
        // The above copyright notice and this permission notice shall be included
        // in all copies or substantial portions of the Software.
        //
        // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
        // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
        // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
        // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
        // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
        // USE OR OTHER DEALINGS IN THE SOFTWARE.

        var formatRegExp = /%[sdj%]/g;
        exports.format = function (f) {
          if (!isString(f)) {
            var objects = [];
            for (var i = 0; i < arguments.length; i++) {
              objects.push(inspect(arguments[i]));
            }
            return objects.join(' ');
          }

          var i = 1;
          var args = arguments;
          var len = args.length;
          var str = String(f).replace(formatRegExp, function (x) {
            if (x === '%%') return '%';
            if (i >= len) return x;
            switch (x) {
              case '%s':
                return String(args[i++]);
              case '%d':
                return Number(args[i++]);
              case '%j':
                try {
                  return JSON.stringify(args[i++]);
                } catch (_) {
                  return '[Circular]';
                }
              default:
                return x;
            }
          });
          for (var x = args[i]; i < len; x = args[++i]) {
            if (isNull(x) || !isObject(x)) {
              str += ' ' + x;
            } else {
              str += ' ' + inspect(x);
            }
          }
          return str;
        };

        // Mark that a method should not be used.
        // Returns a modified function which warns once by default.
        // If --no-deprecation is set, then it is a no-op.
        exports.deprecate = function (fn, msg) {
          // Allow for deprecating things in the process of starting up.
          if (isUndefined(global.process)) {
            return function () {
              return exports.deprecate(fn, msg).apply(this, arguments);
            };
          }

          if (process.noDeprecation === true) {
            return fn;
          }

          var warned = false;
          function deprecated() {
            if (!warned) {
              if (process.throwDeprecation) {
                throw new Error(msg);
              } else if (process.traceDeprecation) {
                console.trace(msg);
              } else {
                console.error(msg);
              }
              warned = true;
            }
            return fn.apply(this, arguments);
          }

          return deprecated;
        };

        var debugs = {};
        var debugEnviron;
        exports.debuglog = function (set) {
          if (isUndefined(debugEnviron)) debugEnviron = process.env.NODE_DEBUG || '';
          set = set.toUpperCase();
          if (!debugs[set]) {
            if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
              var pid = process.pid;
              debugs[set] = function () {
                var msg = exports.format.apply(exports, arguments);
                console.error('%s %d: %s', set, pid, msg);
              };
            } else {
              debugs[set] = function () {};
            }
          }
          return debugs[set];
        };

        /**
         * Echos the value of a value. Trys to print the value out
         * in the best way possible given the different types.
         *
         * @param {Object} obj The object to print out.
         * @param {Object} opts Optional options object that alters the output.
         */
        /* legacy: obj, showHidden, depth, colors*/
        function inspect(obj, opts) {
          // default options
          var ctx = {
            seen: [],
            stylize: stylizeNoColor
          };
          // legacy...
          if (arguments.length >= 3) ctx.depth = arguments[2];
          if (arguments.length >= 4) ctx.colors = arguments[3];
          if (isBoolean(opts)) {
            // legacy...
            ctx.showHidden = opts;
          } else if (opts) {
            // got an "options" object
            exports._extend(ctx, opts);
          }
          // set default options
          if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
          if (isUndefined(ctx.depth)) ctx.depth = 2;
          if (isUndefined(ctx.colors)) ctx.colors = false;
          if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
          if (ctx.colors) ctx.stylize = stylizeWithColor;
          return formatValue(ctx, obj, ctx.depth);
        }
        exports.inspect = inspect;

        // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
        inspect.colors = {
          'bold': [1, 22],
          'italic': [3, 23],
          'underline': [4, 24],
          'inverse': [7, 27],
          'white': [37, 39],
          'grey': [90, 39],
          'black': [30, 39],
          'blue': [34, 39],
          'cyan': [36, 39],
          'green': [32, 39],
          'magenta': [35, 39],
          'red': [31, 39],
          'yellow': [33, 39]
        };

        // Don't use 'blue' not visible on cmd.exe
        inspect.styles = {
          'special': 'cyan',
          'number': 'yellow',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red'
        };

        function stylizeWithColor(str, styleType) {
          var style = inspect.styles[styleType];

          if (style) {
            return "\x1B[" + inspect.colors[style][0] + 'm' + str + "\x1B[" + inspect.colors[style][1] + 'm';
          } else {
            return str;
          }
        }

        function stylizeNoColor(str, styleType) {
          return str;
        }

        function arrayToHash(array) {
          var hash = {};

          array.forEach(function (val, idx) {
            hash[val] = true;
          });

          return hash;
        }

        function formatValue(ctx, value, recurseTimes) {
          // Provide a hook for user-specified inspect functions.
          // Check that value is an object with an inspect function on it
          if (ctx.customInspect && value && isFunction(value.inspect) &&
          // Filter out the util module, it's inspect function is special
          value.inspect !== exports.inspect &&
          // Also filter out any prototype objects using the circular check.
          !(value.constructor && value.constructor.prototype === value)) {
            var ret = value.inspect(recurseTimes, ctx);
            if (!isString(ret)) {
              ret = formatValue(ctx, ret, recurseTimes);
            }
            return ret;
          }

          // Primitive types cannot have properties
          var primitive = formatPrimitive(ctx, value);
          if (primitive) {
            return primitive;
          }

          // Look up the keys of the object.
          var keys = Object.keys(value);
          var visibleKeys = arrayToHash(keys);

          if (ctx.showHidden) {
            keys = Object.getOwnPropertyNames(value);
          }

          // IE doesn't make error fields non-enumerable
          // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
          if (isError(value) && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
            return formatError(value);
          }

          // Some type of object without properties can be shortcutted.
          if (keys.length === 0) {
            if (isFunction(value)) {
              var name = value.name ? ': ' + value.name : '';
              return ctx.stylize('[Function' + name + ']', 'special');
            }
            if (isRegExp(value)) {
              return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
            }
            if (isDate(value)) {
              return ctx.stylize(Date.prototype.toString.call(value), 'date');
            }
            if (isError(value)) {
              return formatError(value);
            }
          }

          var base = '',
              array = false,
              braces = ['{', '}'];

          // Make Array say that they are Array
          if (isArray(value)) {
            array = true;
            braces = ['[', ']'];
          }

          // Make functions say that they are functions
          if (isFunction(value)) {
            var n = value.name ? ': ' + value.name : '';
            base = ' [Function' + n + ']';
          }

          // Make RegExps say that they are RegExps
          if (isRegExp(value)) {
            base = ' ' + RegExp.prototype.toString.call(value);
          }

          // Make dates with properties first say the date
          if (isDate(value)) {
            base = ' ' + Date.prototype.toUTCString.call(value);
          }

          // Make error with message first say the error
          if (isError(value)) {
            base = ' ' + formatError(value);
          }

          if (keys.length === 0 && (!array || value.length == 0)) {
            return braces[0] + base + braces[1];
          }

          if (recurseTimes < 0) {
            if (isRegExp(value)) {
              return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
            } else {
              return ctx.stylize('[Object]', 'special');
            }
          }

          ctx.seen.push(value);

          var output;
          if (array) {
            output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
          } else {
            output = keys.map(function (key) {
              return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
            });
          }

          ctx.seen.pop();

          return reduceToSingleString(output, base, braces);
        }

        function formatPrimitive(ctx, value) {
          if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');
          if (isString(value)) {
            var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
            return ctx.stylize(simple, 'string');
          }
          if (isNumber(value)) return ctx.stylize('' + value, 'number');
          if (isBoolean(value)) return ctx.stylize('' + value, 'boolean');
          // For some reason typeof null is "object", so special case here.
          if (isNull(value)) return ctx.stylize('null', 'null');
        }

        function formatError(value) {
          return '[' + Error.prototype.toString.call(value) + ']';
        }

        function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
          var output = [];
          for (var i = 0, l = value.length; i < l; ++i) {
            if (hasOwnProperty(value, String(i))) {
              output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
            } else {
              output.push('');
            }
          }
          keys.forEach(function (key) {
            if (!key.match(/^\d+$/)) {
              output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
            }
          });
          return output;
        }

        function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
          var name, str, desc;
          desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
          if (desc.get) {
            if (desc.set) {
              str = ctx.stylize('[Getter/Setter]', 'special');
            } else {
              str = ctx.stylize('[Getter]', 'special');
            }
          } else {
            if (desc.set) {
              str = ctx.stylize('[Setter]', 'special');
            }
          }
          if (!hasOwnProperty(visibleKeys, key)) {
            name = '[' + key + ']';
          }
          if (!str) {
            if (ctx.seen.indexOf(desc.value) < 0) {
              if (isNull(recurseTimes)) {
                str = formatValue(ctx, desc.value, null);
              } else {
                str = formatValue(ctx, desc.value, recurseTimes - 1);
              }
              if (str.indexOf('\n') > -1) {
                if (array) {
                  str = str.split('\n').map(function (line) {
                    return '  ' + line;
                  }).join('\n').substr(2);
                } else {
                  str = '\n' + str.split('\n').map(function (line) {
                    return '   ' + line;
                  }).join('\n');
                }
              }
            } else {
              str = ctx.stylize('[Circular]', 'special');
            }
          }
          if (isUndefined(name)) {
            if (array && key.match(/^\d+$/)) {
              return str;
            }
            name = JSON.stringify('' + key);
            if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
              name = name.substr(1, name.length - 2);
              name = ctx.stylize(name, 'name');
            } else {
              name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
              name = ctx.stylize(name, 'string');
            }
          }

          return name + ': ' + str;
        }

        function reduceToSingleString(output, base, braces) {
          var numLinesEst = 0;
          var length = output.reduce(function (prev, cur) {
            numLinesEst++;
            if (cur.indexOf('\n') >= 0) numLinesEst++;
            return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
          }, 0);

          if (length > 60) {
            return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
          }

          return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
        }

        // NOTE: These type checking functions intentionally don't use `instanceof`
        // because it is fragile and can be easily faked with `Object.create()`.
        function isArray(ar) {
          return Array.isArray(ar);
        }
        exports.isArray = isArray;

        function isBoolean(arg) {
          return typeof arg === 'boolean';
        }
        exports.isBoolean = isBoolean;

        function isNull(arg) {
          return arg === null;
        }
        exports.isNull = isNull;

        function isNullOrUndefined(arg) {
          return arg == null;
        }
        exports.isNullOrUndefined = isNullOrUndefined;

        function isNumber(arg) {
          return typeof arg === 'number';
        }
        exports.isNumber = isNumber;

        function isString(arg) {
          return typeof arg === 'string';
        }
        exports.isString = isString;

        function isSymbol(arg) {
          return (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'symbol';
        }
        exports.isSymbol = isSymbol;

        function isUndefined(arg) {
          return arg === void 0;
        }
        exports.isUndefined = isUndefined;

        function isRegExp(re) {
          return isObject(re) && objectToString(re) === '[object RegExp]';
        }
        exports.isRegExp = isRegExp;

        function isObject(arg) {
          return (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && arg !== null;
        }
        exports.isObject = isObject;

        function isDate(d) {
          return isObject(d) && objectToString(d) === '[object Date]';
        }
        exports.isDate = isDate;

        function isError(e) {
          return isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error);
        }
        exports.isError = isError;

        function isFunction(arg) {
          return typeof arg === 'function';
        }
        exports.isFunction = isFunction;

        function isPrimitive(arg) {
          return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'symbol' || // ES6 symbol
          typeof arg === 'undefined';
        }
        exports.isPrimitive = isPrimitive;

        exports.isBuffer = require('./support/isBuffer');

        function objectToString(o) {
          return Object.prototype.toString.call(o);
        }

        function pad(n) {
          return n < 10 ? '0' + n.toString(10) : n.toString(10);
        }

        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // 26 Feb 16:19:34
        function timestamp() {
          var d = new Date();
          var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
          return [d.getDate(), months[d.getMonth()], time].join(' ');
        }

        // log is just a thin wrapper to console.log that prepends a timestamp
        exports.log = function () {
          console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
        };

        /**
         * Inherit the prototype methods from one constructor into another.
         *
         * The Function.prototype.inherits from lang.js rewritten as a standalone
         * function (not on Function.prototype). NOTE: If this file is to be loaded
         * during bootstrapping this function needs to be rewritten using some native
         * functions as prototype setup using normal JavaScript does not work as
         * expected during bootstrapping (see mirror.js in r114903).
         *
         * @param {function} ctor Constructor function which needs to inherit the
         *     prototype.
         * @param {function} superCtor Constructor function to inherit prototype from.
         */
        exports.inherits = require('inherits');

        exports._extend = function (origin, add) {
          // Don't do anything if add isn't an object
          if (!add || !isObject(add)) return origin;

          var keys = Object.keys(add);
          var i = keys.length;
          while (i--) {
            origin[keys[i]] = add[keys[i]];
          }
          return origin;
        };

        function hasOwnProperty(obj, prop) {
          return Object.prototype.hasOwnProperty.call(obj, prop);
        }
      }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, { "./support/isBuffer": 31, "_process": 26, "inherits": 30 }] }, {}, [1])(1);
});