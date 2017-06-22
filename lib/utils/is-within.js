'use strict';

module.exports = (target, els, checkSelf) => {
  els = !els.length ? [els] : els;

  if (checkSelf && els.indexOf(target) > -1) { return true; }
  let parent = target.parentNode;
  // walk
  while (parent && parent.tagName !== 'HTML') {
    if (els.indexOf(parent) > -1) { return true; }
    parent = parent.parentNode;
  }

  return false;
};
