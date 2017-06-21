'use strict';

/**
 * Checks if an option is COMPLETELY visible in a list
 * @param  {HTMLElement} list The scrollable list element
 * @param  {HTMLElement} opt  The option in question
 * @return {Boolean}
 */
module.exports = (list, opt) => {
  const listHeight = list.clientHeight;
  const optHeight = opt.clientHeight;
  const scrollTop = list.scrollTop;
  const offsetTop = opt.offsetTop;
  const isAbove = scrollTop > offsetTop;
  const isBelow = ((scrollTop + listHeight) - optHeight) < offsetTop;

  return !isAbove && !isBelow;
};
