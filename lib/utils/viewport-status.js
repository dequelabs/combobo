'use strict';


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
