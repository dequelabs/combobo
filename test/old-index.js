'use strict';
return;
var MARKUP = [
  '<section>',
    '<div class="wrp">',
      '<label for="combobox">Choose Band</label>',
      '<div class="combo-wrap">',
        '<input type="text" class="combobox" id="combobox">',
        '<i aria-hidden="true" class="fa fa-caret-down"></i>',
        '<div class="listbox">',
          '<div id="ween" class="option">Ween</div>',
          '<div class="option">Frank Zappa</div>',
          '<div class="option">Snarky Puppy</div>',
          '<div class="option">Umphreys McGee</div>',
          '<div class="option">Keller Williams</div>',
          '<div class="option">Greensky Bluegrass</div>',
          '<div class="option">Leftover Salmon</div>',
          '<div class="option">Moe.</div>',
          '<div class="option">Family Groove Company</div>',
          '<div class="option">Mac Demarco</div>',
          '<div class="option">Lettuce</div>',
        '</div>',
      '</div>',
    '</div>',
    '<button type="button">Submit</button>',
  '</section>'
].join('');

describe('Combobo', function () {
  var fixture = document.getElementById('fixture');
  var combobox;

  beforeEach(function () {
    fixture.innerHTML = MARKUP;
    combobox = new Combobo({
      activeClass: 'active',
      options: '.wrp .listbox .option',
      optionValue: 'foo'
    });
  });

  afterEach(function () {
    if (combobox.liveRegion && combobox.liveRegion.region) {
      combobox.liveRegion.region.parentNode.removeChild(combobox.liveRegion.region);
    }
    fixture.innerHTML = ''; // clean up
  });

  it('should merge user config with default config', function () {
    // confirm the custom config passed in overrode the defaults
    assert.equal(combobox.config.activeClass, 'active');
    assert.equal(combobox.config.options, '.wrp .listbox .option');
    // confirm that the other defaults were written to config
    assert.equal(combobox.config.useLiveRegion, true);
    assert.equal(combobox.config.filter, 'contains');
    assert.equal(combobox.config.openClass, 'open');
  });

  it('should set initial states', function () {
    assert.equal(combobox.isOpen, false);
    assert.isFalse(!!combobox.currentOption);
    assert.isFalse(combobox.isHovering);
  });

  it('should set initial attributes', function () {
    var input = combobox.input;
    var list = combobox.list;

    assert.equal(input.getAttribute('role'), 'combobox');
    assert.equal(list.getAttribute('role'), 'listbox');
    assert.equal(input.getAttribute('aria-owns'), list.id);
    assert.equal(input.getAttribute('aria-expanded'), 'false');
    assert.equal(input.getAttribute('aria-autocomplete'), 'list');
  });

  describe('Combobo#updateOpts', function () {
    it('should properly configure the display of options', function () {
      // input value
      combobox.input.value = 'WEE';
      // fire a keyup
      simulant.fire(combobox.input, 'keyup', {which: 78});
      combobox.cachedOpts.forEach(function (opt) {
        var isHidden = opt.style.display === 'none';
        if (opt.id && opt.id === 'ween') {
          assert.isFalse(isHidden);
        } else {
          assert.isTrue(isHidden)
        }
      });
    });

    it('should properly configure the innerHTML of options', function () {
      // input value
      combobox.input.value = 'WEE';
      // fire a keyup
      simulant.fire(combobox.input, 'keyup', {which: 78});
      var foo = document.getElementById('ween').querySelector('.foo');
      assert.isTrue(!!foo);
      assert.equal(foo.innerHTML.toLowerCase(), 'wee');
    });
  });

  describe('liveRegion', function () {
    it('should create a live region', function () {
      assert.isTrue(!!combobox.liveRegion);
      assert.isTrue(document.body.contains(combobox.liveRegion.region))
    });

    it('should announce changes', function () {
      // fire 3 down arrows...
      simulant.fire(combobox.input, 'keydown', {which: 40});
      simulant.fire(combobox.input, 'keydown', {which: 40});
      simulant.fire(combobox.input, 'keydown', {which: 40});
      assert.isTrue(!!combobox.liveRegion.region.childElementCount);
    });
  });

  describe('Combobo#openList', function () {
    it('should add the open class to the listbox', function () {
      var listbox = combobox.list;
      assert.isFalse(listbox.classList.contains('open'));
      combobox.openList();
      assert.isTrue(listbox.classList.contains('open'));
    });

    it('should set aria-expanded to "true" on the input', function () {
      var input = combobox.input;
      assert.equal(input.getAttribute('aria-expanded'), 'false');
      combobox.openList();
      assert.equal(input.getAttribute('aria-expanded'), 'true');
    });

    it('should update the isOpen prop to `true`', function () {
      assert.isFalse(combobox.isOpen);
      combobox.openList();
      assert.isTrue(combobox.isOpen);
    });

    it('should emit the "list:open" event', function (done) {
      combobox.on('list:open', done);
      combobox.openList();
    });

    it('should be chainable', function () {
      // test will fail if this stuff fails
      combobox.openList().closeList().openList().closeList();
    });
    // TODO: Phantom doesn't let us check if the element is in view
    // (got this test passing in the browser but failing in headless)
    it.skip('should ensure the list is in view');
  });

  describe('Combobo#closeList', function () {
    it('should remove the open class from the listbox', function () {
      var listbox = combobox.list;
      combobox.openList();
      assert.isTrue(listbox.classList.contains('open'));
      combobox.closeList();
      assert.isFalse(listbox.classList.contains('open'));
    });

    it('should set aria-expanded to "false" on the input', function () {
      var input = combobox.input;
      combobox.openList();
      assert.equal(input.getAttribute('aria-expanded'), 'true');
      combobox.closeList();
      assert.equal(input.getAttribute('aria-expanded'), 'false');
    });

    it('should update the isOpen prop to `false`', function () {
      combobox.openList();
      assert.isTrue(combobox.isOpen);
      combobox.closeList();
      assert.isFalse(combobox.isOpen);
    });

    it('should focus the input given a truthy `focus` argument', function () {
      document.body.focus(); // ensure the input isnt focused
      combobox.closeList(true);
      assert.equal(document.activeElement, combobox.input);
    });

    it('should emit the "list:close" event', function (done) {
      combobox.on('list:close', done);
      combobox.closeList();
    });

    it('should be chainable', function () {
      // test will fail if this stuff fails
      combobox.closeList().openList().closeList().openList();
    });
  });

  describe('events', function () {
    describe('option events', function () {
      describe('click', function () {
        it('should select the clicked option', function (done) {
          var options = combobox.currentOpts;
          assert.isFalse(!!combobox.currentOption);

          combobox.on('selection', function () {
            assert.equal(combobox.currentOption, options[1]);
            done();
          });

          simulant.fire(options[1], 'click');
        });
      });

      describe('mouseover', function () {
        it('should remove active class from previously active and add it to the currently active option', function () {
          var options = combobox.currentOpts;
          // trick the combobox into thinking the 3rd option is active
          options[2].classList.add('active');
          combobox.goTo(2);
          // fire a mouseover on the 1st option
          simulant.fire(options[0], 'mouseover');
          assert.isFalse(options[2].classList.contains('active'));
          assert.isTrue(options[0].classList.contains('active'));
        });

        it('should update the isHovering property and set it to `true`', function () {
          assert.isFalse(combobox.isHovering);
          simulant.fire(combobox.currentOpts[0], 'mouseover');
          assert.isTrue(combobox.isHovering);
        });
      });

      describe('mouseout', function () {
        it('should remove the active class from the option', function () {
          var options = combobox.currentOpts;
          simulant.fire(options[0], 'mouseover');
          assert.isTrue(options[0].classList.contains('active'));
          simulant.fire(options[0], 'mouseout');
          assert.isFalse(options[0].classList.contains('active'));
        });

        it('should update the isHovering property and set it to `false`', function () {
          simulant.fire(combobox.currentOpts[0], 'mouseover');
          assert.isTrue(combobox.isHovering);
          simulant.fire(combobox.currentOpts[0], 'mouseout');
          assert.isFalse(combobox.isHovering);
        });
      });
    });

    describe('input (combobox) events', function () {
      describe('click', function () {
        it('should open the list', function (done) {
          combobox.on('list:open', done);
          combobox.input.click();
        });

        it('should go to the first option if none are selected initially', function () {
          combobox.input.click();
          assert.isTrue(combobox.currentOpts[0].classList.contains('active'));
        });

        it('should go to the currently selected option if applicable', function () {
          var options = combobox.currentOpts;
          combobox.openList();
          simulant.fire(options[1], 'click');
          combobox.closeList();
          assert.isTrue(options[1].classList.contains('selected'));
        });
      });

      describe('blur', function () {
        it('should close the list if isHovering is false', function (done) {
          combobox.openList();
          combobox.on('list:close', done);
          simulant.fire(combobox.input, 'blur');
        });

        it('shouldn\'t close the list if isHovering is true', function () {
          combobox.openList();
          combobox.isHovering = true;
          simulant.fire(combobox.input, 'blur');
          assert.isTrue(combobox.isOpen);
        });
      });

      describe('keydown', function () {
        describe('up arrow', function () {
          // TODO: refer to spec and confirm that this is expected behavior
          it('should open the list if the list is closed', function (done) {
            combobox.on('list:open', done);
            simulant.fire(combobox.input, 'keydown', {which: 38});
          });

          it('should go to the previous option if the list is open', function () {
            // fire 3 down arrows...
            simulant.fire(combobox.input, 'keydown', {which: 40});
            simulant.fire(combobox.input, 'keydown', {which: 40});
            simulant.fire(combobox.input, 'keydown', {which: 40});
            assert.equal(combobox.currentOpts[2], combobox.currentOption);
            // fire 1 up arrow
            simulant.fire(combobox.input, 'keydown', {which: 38});
            assert.equal(combobox.currentOpts[1], combobox.currentOption);
            assert.isTrue(combobox.currentOpts[1].classList.contains('active'));
          });
        });

        describe('down arrow', function () {
          it('should open the list if the list is closed', function () {
            assert.isFalse(combobox.isOpen);
            simulant.fire(combobox.input, 'keydown', {which: 40});
            assert.isTrue(combobox.isOpen);
          });

          it('should go to the next option if the list is open', function () {
            // fire 3 down arrows...
            simulant.fire(combobox.input, 'keydown', {which: 40});
            simulant.fire(combobox.input, 'keydown', {which: 40});
            simulant.fire(combobox.input, 'keydown', {which: 40});
            assert.equal(combobox.currentOpts[2], combobox.currentOption);
          });
        });

        describe('enter', function () {
          it('should select the currently active option', function () {
            // fire down arrow
            simulant.fire(combobox.input, 'keydown', {which: 40});
            assert.equal(combobox.currentOpts[0], combobox.currentOption);
            // fire enter
            simulant.fire(combobox.input, 'keydown', {which: 13});
            assert.equal(combobox.currentOpts[0].innerText, combobox.input.value);
          });
        });

        describe('escape', function () {
          it('should close the list', function () {
            // fire down arrow
            simulant.fire(combobox.input, 'keydown', {which: 40});
            assert.isTrue(combobox.isOpen);
            // fire escape
            simulant.fire(combobox.input, 'keydown', {which: 27});
            assert.isFalse(combobox.isOpen);
          });
        });
      });

      describe('keyup', function () {
        describe('filter', function () {
          describe('off the shelf (contains, starts-with and equals)', function () {
            it('should be case-insensitive', function () {
              // input value
              combobox.input.value = 'WEE';
              // fire a keyup
              simulant.fire(combobox.input, 'keyup', {which: 78});
              assert.equal(combobox.currentOpts.length, 1);
              assert.equal(combobox.currentOpts[0].innerText, 'Ween');
            });

            describe('"contains" (default)', function () {
              it('should filter out everything that doesn\'t contain the current value', function () {
                combobox.input.value = 'mo';
                simulant.fire(combobox.input, 'keyup', {which: 78});
                assert.equal(combobox.currentOpts.length, 2);
                assert.equal(combobox.currentOpts[0].innerText, 'Leftover Salmon');
                assert.equal(combobox.currentOpts[1].innerText, 'Moe.');
              });
            });

            describe('starts-with', function () {
              beforeEach(function () {
                fixture.innerHTML = MARKUP;
                combobox = new Combobo({
                  activeClass: 'active',
                  filter: 'starts-with'
                });
              });

              afterEach(function () {
                fixture.innerHTML = ''; // clean up
              });

              it('should filter out everything that doesn\'t start with the current value', function () {
                combobox.input.value = 'F';
                simulant.fire(combobox.input, 'keyup', {which: 78});
                assert.equal(combobox.currentOpts.length, 2);
                assert.equal(combobox.currentOpts[0].innerText, 'Frank Zappa');
                assert.equal(combobox.currentOpts[1].innerText, 'Family Groove Company');
              });
            });

            describe('equals', function () {
              beforeEach(function () {
                fixture.innerHTML = MARKUP;
                combobox = new Combobo({
                  activeClass: 'active',
                  filter: 'equals'
                });
              });

              afterEach(function () {
                fixture.innerHTML = ''; // clean up
              });

              it('should filter out everything that doesn\'t equal the current value', function () {
                combobox.input.value = 'WEEN';
                simulant.fire(combobox.input, 'keyup', {which: 78});
                assert.equal(combobox.currentOpts.length, 1);
                assert.equal(combobox.currentOpts[0].innerText, 'Ween');
              });
            });
          });

          describe('custom function', function () {
            beforeEach(function () {
              fixture.innerHTML = MARKUP;
              combobox = new Combobo({
                activeClass: 'active',
                filter: function (val, allOpts) {
                  return allOpts.filter(function (o) { return o.textContent === 'Frank Zappa'});
                }
              });
            });

            afterEach(function () {
              fixture.innerHTML = ''; // clean up
            });

            it('should filter with a user-provided function', function () {
              combobox.input.value = 'blah';
              simulant.fire(combobox.input, 'keyup', {which: 78});
              assert.equal(combobox.currentOpts.length, 1);
              assert.equal(combobox.currentOpts[0].innerText, 'Frank Zappa');
            });
          });
        });
      });
    });

    describe('document events', function () {
      describe('click', function () {
        it('should close the list with a click outside of the widget', function (done) {
          combobox.openList();
          combobox.on('list:close', done);
          simulant.fire(document, 'click');
        });

        it('shouldn\'t close the list with a click within the widget', function () {
          combobox.openList();
          simulant.fire(combobox.list, 'click');
          assert.isTrue(combobox.isOpen);
        });
      });
    });

    describe('selected events', function() {
      it('should repopulate input value when list is closed or focus is changed', function() {
        var options = combobox.currentOpts;
        simulant.fire(options[0], 'click');
        simulant.fire(combobox.input, 'keydown', {which: 27});
        combobox.closeList();
        simulant.fire(combobox.input, 'blur')
        assert.equal(combobox.input.value, 'Ween');

      });

      it('should remove selected class once different element is selected', function(done) {
        var options = combobox.currentOpts;
        combobox.once('selection', function () {
          assert.isTrue(options[1].classList.contains('selected'));
          assert.equal(options[1], combobox.selected[0]);
          // another selection on a different opt
          combobox.once('selection', function () {
            assert.isFalse(options[1].classList.contains('selected'));
            assert.isTrue(options[0].classList.contains('selected'));
            assert.equal(options[0], combobox.selected[0]);
            done();
          });

          simulant.fire(options[0], 'click');
        });

        simulant.fire(options[1], 'click');

      });

      it('should add selected class to new selected element', function() {
        var options = combobox.currentOpts;
        combobox.once('selection', function() {
          assert.isTrue(options[1].classList.contains('selected'));
          assert.equal(options[1], combobox.selected[0]);
        });
        simulant.fire(options[1], 'click');
      });

      it('should show all other options once element is selected', function() {
        var options = combobox.cachedOpts;
        combobox.once('selection', function() {
          var visibleOpts = options.filter(function(opt) {
            return opt.style.display === '';
          });
          assert.equal(visibleOpts.length, options.length);
        });
        simulant.fire(options[1], 'click');
      });
    });

    describe('Multi-select events', function() {
      beforeEach(function () {
        fixture.innerHTML = MARKUP;
        combobox = new Combobo({
          activeClass: 'active',
          multiselect: true,
          selectionValue: function (selectedOptions) {
            return selectedOptions.length > 1 ?
              '{ ' + selectedOptions.length +  ' selected }' :
              selectedOptions[0].innerText.trim();
          },
          noResultsText: 'No results found.'
        });
      });

      afterEach(function () {
        fixture.innerHTML = ''; // clean up
      });

      it('should select more than one option', function() {
        var options = combobox.currentOpts;
        simulant.fire(options[1], 'click');
        simulant.fire(options[0], 'click');
        assert.equal(combobox.selected.length, 2);
      });

      it('should populate input value with multi selected count', function() {
        var options = combobox.currentOpts;
        simulant.fire(options[1], 'click');
        simulant.fire(options[0], 'click');
        simulant.fire(options[2], 'click');
        assert.equal(combobox.config.selectionValue(combobox.selected), '{ 3 selected }');
      });

      it('should remove selected option on second click', function() {
        var options = combobox.currentOpts;
        simulant.fire(options[0], 'click');
        simulant.fire(options[1], 'click');
        simulant.fire(options[1], 'click');
        assert.equal(combobox.selected.length, 1);
      });

      it('should show the noResultsText when there are no matches', function() {
        combobox.input.value = '345356456';
        simulant.fire(combobox.input, 'keyup', {which: 78});
        var noResults = document.querySelector('.no-results-text');
        assert.equal(combobox.currentOpts.length, 0);
        assert.equal(noResults.textContent, combobox.config.noResultsText)
      });

      it('should clear input when 2 or more options are selected and backspace is hit', function() {
        var options = combobox.currentOpts;
        simulant.fire(options[0], 'click');
        simulant.fire(options[1], 'click');
        // Trigger backspace
        simulant.fire(combobox.input, 'keydown', {which:8});
        assert.equal(combobox.input.value, '');

      });

      it('should clear input when input is focused and has 2 or more options selected', function() {
        var options = combobox.currentOpts;
        simulant.fire(options[0], 'click');
        simulant.fire(options[1], 'click');
        // Trigger a focused
        simulant.fire(combobox.input, 'focus');
        assert.equal(combobox.input.value, '');
      });
    });
  });
});
