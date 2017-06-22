'use strict';

describe('LiveRegion', function () {
  var polite = new LiveRegion();

  it('should create a region element', function () {
    assert.isDefined(polite.region);
  });

  it('should default to polite', function () {
    assert.equal(polite.region.getAttribute('aria-live'), 'polite');
  });

  describe('announcement', function () {
    it('should add an element with the provided text', function (done) {
      polite.announce('Hello', 10);
      assert.equal(polite.region.firstChild.innerHTML, 'Hello');
      setTimeout(done, 11);
    });

    it('should expire after the provided ms', function (done) {
      polite.announce('Hello', 100);
      assert.equal(polite.region.childElementCount, 1);
      setTimeout(function () {
        assert.equal(polite.region.childElementCount, 0);
        done();
      }, 100);
    });
  });

});
