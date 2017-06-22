var events = require('events');

var emitter = new events.EventEmitter();

emitter.on('test', function () {
  console.log('hello emitter');
});
emitter.emit('test');
