'use strict';

module.exports = (groups, option) => {
  const matches = groups.filter((g) => g.options.indexOf(option) > -1);
  return matches.length && matches[0];
};
