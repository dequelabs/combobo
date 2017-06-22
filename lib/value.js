'use strict';

module.exports = (el) => el.getAttribute('data-value') || el.innerText;
