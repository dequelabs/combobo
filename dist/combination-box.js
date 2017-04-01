"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function e(t, n, r) {
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
})({ 1: [function (require, module, exports) {
    'use strict';

    var elementHandler = require('./lib/element-handler');
    var Classlist = require('classlist');
    var defaults = {
      input: '.combobox',
      list: '.listbox',
      options: '.listbox .options'
    };

    if (typeof module !== 'undefined') {
      module.exports = Combo;
    }

    /**
     * usage?
     * const Combobox = require('combination-box');
     * const combo = new Combobox({
     *   input: el || 'selector',
     *   list: el || 'selector',
     *   options: els || 'selector',
     *   openClass: 'open'
     * })
     */

    var Combo = function () {
      function Combo(config) {
        _classCallCheck(this, Combo);

        // TODO: merge config with defaults
        this.input = elementHandler(config.input);
        this.list = elementHandler(config.list);
        this.options = elementHandler(config.options);
        this.openClass = config.openClass;

        this.initEvents();
      }

      _createClass(Combo, [{
        key: "initEvents",
        value: function initEvents() {
          this.input.addEventListener('click', this.openList.bind(this));
        }
      }, {
        key: "openList",
        value: function openList() {
          Classlist(this.list).add(this.openClass);
        }
      }, {
        key: "closeList",
        value: function closeList() {
          Classlist(this.list).remove(this.openClass);
        }
      }]);

      return Combo;
    }();
  }, { "./lib/element-handler": 2, "classlist": 4 }], 2: [function (require, module, exports) {
    'use strict';

    var select = require('./select');

    module.exports = function (l, all) {
      if (typeof l === 'string') {
        return all ? select.all(l) : select(all);
      }

      return l;
    };
  }, { "./select": 3 }], 3: [function (require, module, exports) {
    'use strict';

    module.exports = function (selector, context) {
      context = context || document;
      return context.querySelector(selector);
    };

    exports.all = function (selector, context) {
      context = context || document;
      return Array.prototype.slice.call(context.querySelectorAll(selector));
    };
  }, {}], 4: [function (require, module, exports) {
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
  }, { "component-indexof": 5, "trim": 6 }], 5: [function (require, module, exports) {
    module.exports = function (arr, obj) {
      if (arr.indexOf) return arr.indexOf(obj);
      for (var i = 0; i < arr.length; ++i) {
        if (arr[i] === obj) return i;
      }
      return -1;
    };
  }, {}], 6: [function (require, module, exports) {

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
  }, {}] }, {}, [1]);