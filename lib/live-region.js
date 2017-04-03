'use strict';

module.exports = () => {
  const div = document.createElement('div');

  div.setAttribute('aria-live', 'polite');
  div.setAttribute('role', 'log');
  div.setAttribute('aria-relevant', 'additions');
  div.setAttribute('aria-atomic', 'false');

  // offscreen it
  div.style.position = 'absolute';
  div.style.width = '1px';
  div.style.height = '1px';
  div.style.marginTop = '-1px';
  div.style.clip = 'rect(1px, 1px, 1px, 1px)';

  return div;
}
