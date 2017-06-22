function getTypeString (value) {
  return Object.prototype.toString.call(value)
}

export function isObject (value) {
  return getTypeString(value) === '[object Object]'
}

export function isArray (value) {
  return value != null && getTypeString(value) === '[object Array]'
}

export function isNumeric (value) {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

export function isPositive (value) {
  return isNumeric(value) && value >= 0
}

export function isFunction (value) {
  return value != null && getTypeString(value) === '[object Function]'
}

export function isElement (value) {
  if (typeof window.HTMLElement === 'object') {
    return value instanceof window.HTMLElement
  } else {
    return !!value &&
      typeof value === 'object' &&
      value !== null &&
      value.nodeType === 1 &&
      typeof value.nodeName === 'string'
  }
}
