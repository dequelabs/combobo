'use strict';


function posY(elm) {
  let test = elm, top = 0;

  while (!!test && test.tagName.toLowerCase() !== 'body') {
    top += test.offsetTop;
    test = test.offsetParent;
  }

  return top;
}

function viewPortHeight() {
  const de = document.documentElement;

  if (!!window.innerWidth) {
    return window.innerHeight;
  } else if ( de && !isNaN(de.clientHeight) ) {
    return de.clientHeight;
  }

  return 0;
}

function scrollY() {
  if (window.pageYOffset) { return window.pageYOffset; }
  return Math.max(document.documentElement.scrollTop, document.body.scrollTop);
}

function checkvisible(elm) {
  const vpH = viewPortHeight(); // Viewport Height
  const st = scrollY(); // Scroll Top
  const y = posY(elm);
  return (y > (vpH + st));
}

module.exports = checkvisible;
