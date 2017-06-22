'use strict';

/**
 * Checks if `target` is completely in viewport and returns an object containing:
 * - {Boolean} visible   if the target is visible
 * - {String}  position  the position the element is offscreen ('top' or 'bottom')
 *
 * @param  {HTMLElement} target the element in question
 * @return {Object}
 */
module.exports = (target) => {
  const windowHeight = window.innerHeight;
  const rect = target.getBoundingClientRect();
  const isOffTop = rect.top < 0;
  const isOffBottom = rect.bottom > windowHeight;
  const isVisible = !isOffTop && !isOffBottom
  const data = {
    visible: isVisible
  };

  if (!isVisible) { data.position = isOffTop ? 'top' : 'bottom'; }

  return data;
};
