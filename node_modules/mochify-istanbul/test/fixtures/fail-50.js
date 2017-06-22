var assert = require('assert');

describe('test1', function () {
  it('should fail 50%', function () {
    if (false) {
      console.log('never executed');
    }
    assert.ok(false, 'This should be true');
  })
});