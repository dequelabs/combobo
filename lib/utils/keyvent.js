'use strict';

import keymap from './keymap';

/**
 * attach
 * @param  {String} eventType the type of keyboard event to be attached
 * @param  {HTMLElement} target    the desired target
 * @param  {Object} config    An array of keys / callbacks
 */
exports.attach = (eventType, target, config) => {
  if (typeof config === 'function') {
    return target.addEventListener(eventType, config);
  }
  if (!config || !config.length) { return; }
  target.addEventListener(eventType, (e) => {
    const keyName = keymap[e.which];

    config.forEach((c) => {
      if (c.keys.indexOf(keyName) > -1) {
        if (c.preventDefault) { e.preventDefault(); }
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

exports.up = (el, config) => exports.attach('keyup', el, config);
exports.down = (el, config) => exports.attach('keydown', el, config);
exports.press = (el, config) => exports.attach('keypress', el, config);
