'use strict';

const keymap = require('./keymap');

/**
 * attach
 * @param  {String} eventType the type of keyboard event to be attached
 * @param  {HTMLElement} target    the desired target
 * @param  {Object} config    An array of keys / callbacks
 */
exports.attach = (eventType, target, config) => {
  if (!config || !config.length) { return; }
  target.addEventListener(eventType, (e) => {
    const which = e.which;

    config.forEach((c) => {
      c.keys.forEach((k) => {
        const thisWhich = keymap[k];
        if (thisWhich !== which) { return; }
        if (c.preventDefault) { e.preventDefault(); }
        c.callback(e, k);
      });
    });
  });
};

/**
 * Example usage:
 * const keyboard = require('keyboard');
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
