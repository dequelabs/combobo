'use strict';

/**
 * Announces info about newly activated (NOT selected) option
 * @param  {HTMLElement} option   the newly active option
 * @param  {Object} config        Combobo configuration object
 * @param  {function} announce    the live region announce function
 * @param  {Boolean} groupChanged if activation entailed a group change (if applicable)
 */
module.exports = (option, config, announce, groupChanged, element) => {
  const isSelected = option.getAttribute('aria-selected') === 'true';
  const selectedText = config.announcement.selected;
  let msg = option.innerText; // TODO: make this more configurable

  // add text about newly entered group (if applicable)
  msg = groupChanged && config.announcement && config.announcement.groupChange ?
    `${config.announcement.groupChange(element)} ${msg}` :
    msg;

  // convey selected state to AT that don't support aria-activedescendant (if applicable)
  msg = isSelected && selectedText ? `${msg} ${selectedText}` : msg;

  // announce info to AT
  announce(msg, 500);
};
