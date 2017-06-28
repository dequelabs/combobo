'use strict';

/**
 * Wraps any matches (between input value on option) in a span with the accent class
 * @param  {HTMLElement} optionEl    The option element
 * @param  {HTMLElement} input       The input element
 * @param  {String} accentClass      The class to be added to the match span
 * @return {String}                  The result html string
 */
module.exports = (optionEl, input, accentClass) => {
  const inputText = input.value;
  const optionText = optionEl.innerText;
  const matchStart = optionText.toLowerCase().indexOf(inputText.toLowerCase());
  const matchLength = inputText.length;

  if (inputText && matchStart >= 0) {
    const before = optionText.substring(0, matchStart);
    const matchText = optionText.substr(matchStart, matchLength);
    const after = optionText.substring(matchStart + matchLength);
    return `${before}<span class="${accentClass}">${matchText}</span>${after}`;
  }

  return optionText;
};
