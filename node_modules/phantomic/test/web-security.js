var xhr = new XMLHttpRequest();
xhr.open('GET', 'about:blank', false);
// Only if web-security is disabled can we reach the cross-origin about:blank
// page, otherwise it will raise an error
xhr.onload = function() {
  console.log('--web-security=false');
};
xhr.send();
