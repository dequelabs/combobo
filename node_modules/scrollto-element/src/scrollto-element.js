import BezierEasing from 'bezier-easing'
import raf from 'raf'
import { isObject, isArray, isNumeric, isFunction, isElement } from './isis'
import scrollableParent from './scrollable-parent'

const defaultBezier = [0.19, 1, 0.22, 1]
function noop () {}
/**
 * Animation scroll
 * @param {object} target HTMLElement
 * @param {number} [during=100] (Optional) Scroll during
 */
function scrollTo (target, during = 100) {
  let offset = 0
  let bezier
  let then

  /* TypeChecking */
  if (isElement(target)) {
    bezier = BezierEasing(...defaultBezier)
    then = noop
  } else if (isObject(target)) {
    if (!isElement(target.element)) {
      throw new TypeError('`element` must be HTMLElement.')
    }
    offset = isNumeric(target.offset) ? target.offset : 0
    bezier = isArray(target.bezier) && target.bezier.length === 4
      ? BezierEasing(...target.bezier)
      : BezierEasing(...defaultBezier)
    during = target.duration
    then = isFunction(target.then) ? target.then : noop
    target = target.element
  } else {
    throw new TypeError('The first argument must be HTMLElement or Object.')
  }
  /* Normalize */
  if (!isNumeric(during) || during < 0) (during = 100)

  const parent = scrollableParent(target)
  const currentScrollTop = parent.scrollTop
  const parentOffsetTop = parent.offsetTop

  let start = null
  let targetScrollTop

  if (parent.nodeName === 'BODY') {
    targetScrollTop = target.getBoundingClientRect().top +
      (window.scrollY || window.pageYOffset || document.body.scrollTop) -
      parentOffsetTop
  } else {
    targetScrollTop = target.offsetTop - parentOffsetTop
  }
  const delta = targetScrollTop - currentScrollTop + offset

  function _run (timestamp) {
    if (start === null) (start = timestamp)
    const progress = timestamp - start
    const offset = bezier(progress / during) * delta
    parent.scrollTop = Math.round(currentScrollTop + offset)

    progress < during ? raf(_run) : then()
  }
  raf(_run)
}

export default scrollTo
