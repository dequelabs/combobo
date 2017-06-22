function throws() {
  throw new Error('Ouch!');
}
function a() {
  throws();
}
function b() {
  a();
}
b();
