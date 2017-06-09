'use strict';

/**
 * @typedef {Object} ElementInView
 * @property {boolean} top Top is in view
 * @property {boolean} bottom Bottom is in view
 * @property {boolean} left Left is in view
 * @property {boolean} right Right is in view
 * @property {boolean} body Body is in view
 */

function getParentRect (parent) {
  if (parent instanceof HTMLElement) {
    return parent.getBoundingClientRect()
  }

  return {
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
  }
}

/**
 * Detect if element is in view
 *
 * @method isElementInView
 * @param  {HTMLElement} element Target element
 * @param  {HTMLElement} [parentElement] Container element, default is widnow
 * @return {ElementInView}
 */
function isElementInView (element, parentElement) {
  if (element instanceof HTMLElement === false) {
    throw TypeError('`element` requires a HTMLElement, but saw' + String(element))
  }

  let top, bottom, left, right, body

  const rect = element.getBoundingClientRect()
  const parentRect = getParentRect(parentElement)

  top = rect.top >= parentRect.top &&
          rect.left < parentRect.right &&
          rect.right > parentRect.left &&
          rect.top < parentRect.bottom

  left = rect.left < parentRect.right &&
          rect.left >= parentRect.left &&
          rect.top < parentRect.bottom &&
          rect.bottom > parentRect.top

  bottom = rect.bottom > parentRect.top &&
            rect.bottom <= parentRect.bottom &&
            rect.left < parentRect.right &&
            rect.right > parentRect.left

  right = rect.bottom > parentRect.top &&
            rect.top < parentRect.bottom &&
            rect.right > parentRect.left &&
            rect.right <= parentRect.right

  body = top || left || bottom || right ||
          (
            rect.left <= parentRect.left &&
            rect.top <= parentRect.top &&
            rect.bottom >= parentRect.bottom &&
            rect.right >= parentRect.right
          )

  return { top, bottom, left, right, body }
}

module.exports = isElementInView;
