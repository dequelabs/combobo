var xhr = new XMLHttpRequest();
// this website should have an intentional bad cert
xhr.open('GET', 'https://revoked.grc.com', false);
xhr.onload = function() {
  console.log('--ignore-ssl-errors=true');
};
xhr.send();
