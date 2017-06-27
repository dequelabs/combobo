'use strict';

const assert = require('chai').assert;
const proxyquire = require('proxyquire');
const Classlist = require('classlist');
const fire = require('simulant').fire;
const Fixture = require('../fixture');
const simpleSnippet = require('../snippets/simple.html');
const groupSnippet = require('../snippets/groups.html');
const configuration = require('../../lib/config');
const Combobo = require('../../');

describe('Combobo', () => {
  let fixture, simpleBox, complexBox;

  before(() => fixture = new Fixture());
  beforeEach(() => {
    fixture.create(`${simpleSnippet}${groupSnippet}`);
    simpleBox = new Combobo({
      input: '#combobox-single',
      list: '#simple-listbox',
      useLiveRegion: true
    });

    complexBox = new Combobo({
      input: '#combobox-single-with-groups',
      list: '#listbox-single-with-groups',
      multiselect: true,
      groups: '.optgroup'
    });
  });
  afterEach(() => fixture.destroy());
  after(() => fixture.cleanUp());

  describe('config', () => {
    it('should call lib/config', () => {
      let called = false;
      const Bobo = proxyquire('../../', {
        './lib/config': (config) => {
          called = true
          return configuration(config);
        }
      });

      new Bobo({
        input: '#combobox-single',
        list: '#simple-listbox'
      });

      assert.isTrue(called);
    });

    describe('given truthy useLiveRegion', () => {
      it('should create the assertive live region', () => {
        const region = simpleBox.liveRegion.region;
        assert.isTrue(!!region);
        assert.equal(region.getAttribute('aria-live'), 'assertive');
      });
    });

    describe('groups', () => {
      it('should properly configure the groups property', () => {
        const opts = fixture.element.querySelectorAll('#listbox-single-with-groups .optgroup');
        assert.isDefined(complexBox.groups);
        assert.equal(complexBox.groups.length, opts.length);
      });
    });
  });

  describe('error handling', () => {
    it('should throw if input/list are unable to be found', () => {
      assert.throws(() => {
        new Combobo({
          input: 'i-no-exist',
          list: 'neither-do-i'
        });
      }, Error, 'Unable to find required elements (list/input)');
    });
  });

  describe('attrs', () => {
    it('should call lib/attributes', () => {
      let called = false;
      const C = proxyquire('../../', {
        './lib/attributes': () => called = true
      });

      new C({
        input: '#combobox-single',
        list: '#simple-listbox'
      });

      assert.isTrue(called);
    });
  });

  describe('initial state', () => {
    it('should properly set initial state', () => {
      assert.isFalse(simpleBox.isOpen);
      assert.isNull(simpleBox.currentOption);
      assert.equal(simpleBox.selected.length, 0);
      assert.equal(simpleBox.groups.length, 0);
      assert.isFalse(simpleBox.isHovering);
    });
  });

  describe('events', () => {
    describe('input clicks', () => {
      it('should open the list', () => {
        const OPEN = simpleBox.config.openClass;
        assert.isFalse(Classlist(simpleBox.list).contains(OPEN));
        fire(simpleBox.input, 'click');
        assert.isTrue(Classlist(simpleBox.list).contains(OPEN));
      });
    });

    describe('input blur', () => {
      describe('given no hover', () => {
        it('should close the list', () => {
          const OPEN = simpleBox.config.openClass;
          // open the list
          fire(simpleBox.input, 'click');
          assert.isTrue(Classlist(simpleBox.list).contains(OPEN));
          fire(simpleBox.input, 'blur');
          assert.isFalse(Classlist(simpleBox.list).contains(OPEN));
        });
      });
    });

    describe('input focus', () => {
      describe('given at least 1 selection', () => {
        it('should properly set the input\'s value', () => {
          complexBox.goTo(0).select().goTo(1).select();
          assert.equal(complexBox.selected.length, 2);
          assert.equal(complexBox.input.value, 'Shirts - Shorts');
          fire(complexBox.input, 'focus');
          assert.equal(complexBox.input.value, '');
        });
      });
    });

    describe('document clicks', () => {
      describe('given a target outside of Combobo', () => {
        it('should close the list', () => {
          const OPEN = simpleBox.config.openClass;
          // open the list
          fire(simpleBox.input, 'click');
          assert.isTrue(Classlist(simpleBox.list).contains(OPEN));
          fire(document, 'click');
          assert.isFalse(Classlist(simpleBox.list).contains(OPEN));
        });
      });
    });

    describe('optionEvents', () => {
      describe('option clicks', () => {
        it('should goTo/select the clicked option', () => {
          const options = simpleBox.cachedOpts;
          const second = options[1];
          assert.equal(0, simpleBox.selected.length);
          fire(second, 'click');
          assert.equal(1, simpleBox.selected.length);
          assert.equal(simpleBox.selected[0], second);
        });
      });

      describe('option mouseovers', () => {
        it('should properly handle activeClass', () => {
          fire(simpleBox.input, 'click'); // open the list
          const options = simpleBox.cachedOpts;
          const first = options[0];
          const second = options[1];
          fire(first, 'mouseover');
          assert.isTrue(Classlist(first).contains(simpleBox.config.activeClass));
          fire(second, 'mouseover');
          assert.isFalse(Classlist(first).contains(simpleBox.config.activeClass));
          assert.isTrue(Classlist(second).contains(simpleBox.config.activeClass));
        });

        it('should set isHovering to true', () => {
          fire(simpleBox.input, 'click'); // open the list
          fire(simpleBox.cachedOpts[2], 'mouseover');
          assert.isTrue(simpleBox.isHovering);
        });
      });

      describe('option mouseouts', () => {
        it('should properly handle activeClass', () => {
          const opt = simpleBox.cachedOpts[2];
          fire(simpleBox.input, 'click'); // open the list
          Classlist(opt).add(simpleBox.config.activeClass);
          fire(opt, 'mouseout');
          assert.isFalse(Classlist(opt).contains(simpleBox.config.activeClass));
        });

        it('should set isHovering to false', () => {
          const opt = simpleBox.cachedOpts[2];
          fire(simpleBox.input, 'click'); // open the list
          fire(opt, 'mouseover');
          assert.isTrue(simpleBox.isHovering);
          fire(opt, 'mouseout');
          assert.isFalse(simpleBox.isHovering);
        });
      });
    });

    describe('keyboard events', () => {
      describe('input keydowns', () => {
        describe('UP/DOWN', () => {
          describe('given a closed list', () => {
            it('should open the list and go to the first option', () => {
              assert.isFalse(Classlist(simpleBox.list).contains(simpleBox.config.openClass));
              fire(simpleBox.input, 'keydown', { which: 40 });
              assert.isTrue(Classlist(simpleBox.list).contains(simpleBox.config.openClass));
            });
          });

          describe('given a open list', () => {
            describe('UP', () => {
              it('should go to the previous option', () => {
                const ACTIVE = simpleBox.config.activeClass;
                simpleBox.openList();
                fire(simpleBox.input, 'keydown', { which: 38 });
                assert.isFalse(Classlist(simpleBox.cachedOpts[1]).contains(ACTIVE));
                assert.isTrue(Classlist(simpleBox.cachedOpts[0]).contains(ACTIVE));
              });
            });

            describe('DOWN', () => {
              it('should go to the next option', () => {
                const ACTIVE = simpleBox.config.activeClass;
                simpleBox.openList();
                fire(simpleBox.input, 'keydown', { which: 40 });
                assert.isTrue(Classlist(simpleBox.cachedOpts[0]).contains(ACTIVE));
                fire(simpleBox.input, 'keydown', { which: 40 });
                assert.isTrue(Classlist(simpleBox.cachedOpts[1]).contains(ACTIVE));
                assert.isFalse(Classlist(simpleBox.cachedOpts[0]).contains(ACTIVE));
              });
            });
          });
        });

        describe('ENTER', () => {
          it('should select the currently active option', () => {
            const ACTIVE = simpleBox.config.activeClass;
            simpleBox.openList();
            fire(simpleBox.input, 'keydown', { which: 40 });
            assert.isTrue(Classlist(simpleBox.cachedOpts[0]).contains(ACTIVE));
            fire(simpleBox.input, 'keydown', { which: 40 });
            assert.isTrue(Classlist(simpleBox.cachedOpts[1]).contains(ACTIVE));
            fire(simpleBox.input, 'keydown', { which: 13 });
            assert.equal(simpleBox.selected[0], simpleBox.cachedOpts[1]);
          });
        });

        describe('ESCAPE', () => {
          it('should close the list', () => {
            simpleBox.openList();
            fire(simpleBox.input, 'keydown', { which: 27 });
            assert.isFalse(Classlist(simpleBox.list).contains(simpleBox.config.openClass));
          });
        });

        describe('BACKSPACE', () => {
          describe('given multiple options selected', () => {
            it('should clear the input\'s value', () => {
              complexBox.goTo(0).select().goTo(1).select();
              assert.equal('Shirts - Shorts', complexBox.input.value);
              fire(complexBox.input, 'keydown', { which: 8 });
              assert.equal('', complexBox.input.value);
            });
          });
        });
      });

      describe('input keyups', () => {
        describe('given a truthy freshSelection', () => {
          it('should reset everything', () => {
            simpleBox.freshSelection = true;
            simpleBox.input.value = 'sh';
            simpleBox.filter();
            assert.notEqual(simpleBox.cachedOpts.length, simpleBox.currentOpts.length);
            fire(simpleBox.input, 'keyup', { which: 66 });
            assert.equal(simpleBox.cachedOpts.length, simpleBox.currentOpts.length);
          });

          describe('given an altered input value', () => {
            it('should filter the options, open the list, and set freshSelection to false', () => {
              simpleBox.freshSelection = true;
              simpleBox.cachedInputValue = 'asdf';
              simpleBox.input.value = 'sh';
              fire(simpleBox.input, 'keyup', { which: 66 });
              assert.isFalse(simpleBox.freshSelection);
              assert.notEqual(simpleBox.cachedOpts.length, simpleBox.currentOpts.length);
              assert.isTrue(Classlist(simpleBox.list).contains(simpleBox.config.openClass));
            });
          });
        });

        describe('given a falsey freshSelection', () => {
          it('should open ensure the list is opened/filtered', () => {
            simpleBox.freshSelection = false;
            assert.equal(simpleBox.cachedOpts.length, simpleBox.currentOpts.length);
            simpleBox.input.value = 'sh';
            fire(simpleBox.input, 'keyup', { which: 66 });
            assert.isTrue(Classlist(simpleBox.list).contains(simpleBox.config.openClass));
            assert.notEqual(simpleBox.cachedOpts.length, simpleBox.currentOpts.length);
          });
        });

        describe('no results', () => {
          describe('given a config with noResults set', () => {
            it('should call no lib/no-results', () => {
              let called = false;
              const C = proxyquire('../../', {
                './lib/no-results': () => called = true
              });

              new C({
                input: '#combobox-single',
                list: '#simple-listbox'
              });

              simpleBox.input.value = 'sh';
              fire(simpleBox.input, 'keyup', { which: 66 });

              assert.isTrue(called)
            });
          });
        });
      });
    });
  });

  describe('openList', () => {
    it('should be chainable', () => {
      assert.doesNotThrow(() => {
        simpleBox.openList().goTo(0).select();
      }, Error);
    });

    it('should add the openClass', () => {
      assert.isFalse(Classlist(simpleBox.list).contains(simpleBox.config.openClass));
      simpleBox.openList();
      assert.isTrue(Classlist(simpleBox.list).contains(simpleBox.config.openClass));
    });

    it('should set aria-expanded to "true"', () => {
      assert.notEqual(complexBox.input.getAttribute('aria-expanded'), 'true');
      complexBox.openList();
      assert.equal(complexBox.input.getAttribute('aria-expanded'), 'true');
    });

    it('should announce the count if the list was not open', () => {
      simpleBox.openList();
      assert.equal(simpleBox.liveRegion.region.childElementCount, 1);
    });

    it('should set isOpen to true', () => {
      assert.isFalse(complexBox.isOpen);
      complexBox.openList();
      assert.isTrue(complexBox.isOpen);
    });

    it('should emit the "list:open" event', (done) => {
      simpleBox
        .on('list:open', done)
        .openList();
    });

    describe('given a list outside the viewport', () => {
      it('should call scrollToElement', () => {
        let called = false;
        const C = proxyquire('../../', {
          './lib/utils/viewport-status': () => ({ visible: false, position: 'top' }),
          'scrollto-element': () => called = true
        });

        const box = new C({
          input: '#combobox-single',
          list: '#simple-listbox'
        });
        box.openList();
        assert.isTrue(called);
      });
    });
  });

  describe('closeList', () => {
    it('should be chainable', () => {
      assert.doesNotThrow(() => {
        simpleBox.openList().closeList().openList();
      }, Error);
    });

    it('should remove the openClass', () => {
      const l = complexBox.list;
      Classlist(l).add(complexBox.config.openClass);
      complexBox.closeList();
      assert.isFalse(Classlist(l).contains(complexBox.config.openClass));
    });

    it('should set aria-expanded to "false"', () => {
      const input = simpleBox.input;
      const isExpanded = () => input.getAttribute('aria-expanded') === 'true';
      input.setAttribute('aria-expanded', 'true');
      simpleBox.closeList();
      assert.isFalse(isExpanded());
    });

    it('should emit the "list:close" event', (done) => {
      simpleBox
        .on('list:close', done)
        .openList()
        .closeList();
    });

    describe('given a truthy "focus" param', () => {
      it('should focus the input', () => {
        assert.notEqual(document.activeElement, complexBox.input);
        complexBox.closeList(true);
        assert.equal(document.activeElement, complexBox.input);
      });
    });

    describe('given falsey multiselect and a selection', () => {
      it('should properly set the input\'s value', () => {
        simpleBox.goTo(1).select();
        simpleBox.input.value = 'Bananas!!!';
        simpleBox.closeList();
        assert.equal(simpleBox.input.value, simpleBox.cachedOpts[1].innerText);
      });
    });
  });

  describe('clearFilters', () => {
    it('should unhide all options/groups', () => {
      simpleBox.cachedOpts.forEach((o) => o.style.display = 'none');
      simpleBox.clearFilters();
      assert.equal(0, simpleBox.cachedOpts.filter((o) => o.style.display === 'none').length);
    });

    it('should update currentOpts', () => {
      simpleBox.currentOpts = [simpleBox.cachedOpts[0]];
      simpleBox.clearFilters();
      assert.equal(simpleBox.currentOpts.length, simpleBox.cachedOpts.length);
    });
  });

  describe('reset', () => {
    beforeEach(() => {
      simpleBox.goTo(1).select();
    });

    it('should clear the value of the input', () => {
      assert.equal(simpleBox.input.value, simpleBox.cachedOpts[1].innerText);
      simpleBox.reset();
      assert.equal(simpleBox.input.value, '');
    });

    it('should remove aria-activedescendant from the input', () => {
      assert.isTrue(!!simpleBox.input.getAttribute('aria-activedescendant'));
      simpleBox.reset();
      assert.isFalse(!!simpleBox.input.getAttribute('aria-activedescendant'));
    });

    it('should remove data-active-option from the input', () => {
      assert.isTrue(!!simpleBox.input.getAttribute('data-active-option'));
      simpleBox.reset();
      assert.isFalse(!!simpleBox.input.getAttribute('data-active-option'));
    });

    it('should set currentOption to null', () => {
      assert.isTrue(!!simpleBox.currentOption);
      simpleBox.reset();
      assert.isFalse(!!simpleBox.currentOption);
    });

    it('should set selected to an empty array', () => {
      assert.equal(simpleBox.selected.length, 1);
      simpleBox.reset();
      assert.equal(simpleBox.selected.length, 0);
    });

    it('should remove the selectedClass from all options', () => {
      const isSelected = el => Classlist(el).contains(simpleBox.config.selectedClass);
      assert.equal(simpleBox.cachedOpts.filter(isSelected).length, 1);
      simpleBox.reset();
      assert.equal(simpleBox.cachedOpts.filter(isSelected).length, 0);
    });

    it('should set aria-selected to false on all options', () => {
      const isSelected = el => el.getAttribute('aria-selected') === 'true';
      assert.equal(simpleBox.cachedOpts.filter(isSelected).length, 1);
      simpleBox.reset();
      assert.equal(simpleBox.cachedOpts.filter(isSelected).length, 0);
    });
  });

  describe('filter', () => {
    describe('given a funktion', () => {
      it('should properly filter', () => {
        let called = false;
        const c = new Combobo({
          input: '#combobox-single',
          list: '#simple-listbox',
          filter: (_, opts) => {
            called = true;
            return opts;
          }
        });

        c.filter();
        assert.isTrue(called);
      });
    });

    describe('given a string (preset)', () => {
      it('should call the right preset', () => {
        let containsCalled = false;
        const C = proxyquire('../../', {
          './lib/filters': {
            'contains': (_, opts) => {
              containsCalled = true;
              return opts;
            }
          }
        });

        const c = new C({
          input: '#combobox-single',
          list: '#simple-listbox',
          filter: 'contains'
        });
        c.filter();
        assert.isTrue(containsCalled);
      });
    });

    describe('given a change in options', () => {
      it('should announce the count', () => {
        simpleBox.input.value = 'sh';
        simpleBox.filter();
        assert.equal(simpleBox.liveRegion.region.childElementCount, 1);
      });
    });
  });

  describe('announceCount', () => {
    describe('given a truthy useLiveRegion', () => {
      it('should call liveRegion.announce', () => {
        let called = false;
        const div = document.createElement('div');
        document.body.appendChild(div);
        const C = proxyquire('../../index', {
          'live-region': () => {
            return {
              region: div,
              announce: () => called = true
            }
          }
        });

        const c = new C({
          input: '#combobox-single',
          list: '#simple-listbox'
        });
        c.announceCount();
        assert.isTrue(called);
      });
    });
  });
});
