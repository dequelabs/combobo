'use strict';

const assert = require('chai').assert;
const Fixture = require('./fixture');
const simpleSnippet = require('./snippets/simple.html');
const groupSnippet = require('./snippets/groups.html');
const Combobo = require('..');

describe('Combobo', () => {
  let fixture, simpleBox, groupsBox;

  before(() => fixture = new Fixture());
  beforeEach(() => {
    fixture.create(`${simpleSnippet}${groupSnippet}`);
    simpleBox = new Combobo({
      input: '#combobox-single',
      list: '#simple-listbox'
    });

    groupsBox = new Combobo({
      input: '#combobox-single-with-groups',
      list: '#listbox-single-with-groups',
      multiselect: true,
      groups: '.optgroup'
    });
  });
  afterEach(() => fixture.destroy());
  after(() => fixture.cleanUp());

  describe('config', () => {
    it('should properly extend defaults with user config');

    describe('given truthy useLiveRegion', () => {
      it('should create the assertive live region');
    });

    describe('groups', () => {
      it('should set isGrouped to true');
      it('should properly configure the groups prop');
    });
  });

  describe('attrs', () => {
    it('should call lib/attributes');
  });

  describe('initial state', () => {
    it('should properly set initial state');
  });

  describe('events', () => {
    describe('input clicks', () => {
      it('should open the list');
    });

    describe('input blur', () => {
      describe('given no hover', () => {
        it('should close the list');
      });
    });

    describe('input focus', () => {
      describe('given at least 1 selection', () => {
        it('should properly set the input\'s value');
      });
    });

    describe('document clicks', () => {
      describe('given a target outside of Combobo', () => {
        it('should close the list');
      });
    });

    describe('optionEvents', () => {
      describe('option clicks', () => {
        it('should goTo/select the clicked option');
      });

      describe('option mouseovers', () => {
        it('should properly handle activeClass');
        it('should set isHovering to true');
      });

      describe('option mouseouts', () => {
        it('should properly handle activeClass');
        it('should set isHovering to false');
      });
    });

    describe('keyboard events', () => {
      describe('input keydowns', () => {
        describe('UP/DOWN', () => {
          describe('given a closed list', () => {
            it('should open the list and go to the first option');
          });

          describe('given a open list', () => {
            describe('UP', () => {
              it('should go to the previous option');
            });

            describe('DOWN', () => {
              it('should go to the next option');
            });
          });
        });

        describe('ENTER', () => {
          it('should select the currently active option');
        });

        describe('ESCAPE', () => {
          it('should close the list');
        });

        describe('BACKSPACE', () => {
          describe('given multiple options selected', () => {
            it('should clear the input\'s value');
          });
        });
      });

      describe('input keyups', () => {
        describe('given a truthy freshSelection', () => {
          it('should reset everything');

          describe('given an altered input value', () => {
            it('should filter the options, open the list, and set freshSelection to false');
          });
        });

        describe('given a falsey freshSelection', () => {
          it('should open ensure the list is opened/filtered');
        });

        describe('no results', () => {
          describe('given a config with noResults set', () => {
            it('should handle no results properly');
          });
        });
      });
    });
  });

  describe('openList', () => {
    it('should be chainable');
    it('should add the openClass');
    it('should set aria-expanded to "true"');
    it('should announce the count if the list was not open');
    it('should set isOpen to true');
    it('should emit the "list:open" event');

    describe('given a list outside the viewport', () => {
      it('should call scrollToElement');
    });
  });

  describe('closeList', () => {
    it('should be chainable');
    it('should remove the openClass');
    it('should set aria-expanded to "false"');
    it('should emit the "liste:close" event');

    describe('given a truthy "focus" param', () => {
      it('should focus the input');
    });

    describe('given multiselect and at least 1 selection', () => {
      it('should properly set the inputs value');
    });
  });

  describe('reset', () => {
    it('should unhide all options/groups');
    it('should update currentOpts');
  });

  describe('filter', () => {
    describe('given a funktion', () => {
      it('should properly filter');
    });

    describe('given a string (preset)', () => {
      it('should call the right preset');
    });

    describe('given a change in options', () => {
      it('should announce the count');
    });
  });

  describe('announceCount', () => {
    describe('given a truthy useLiveRegion', () => {
      it('should call liveRegion.announce');
    });
  });
});
