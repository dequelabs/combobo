# Combobo
Combination Box built with accessibility in mind.

## Installation
```bash
$ npm install combobo
```

## Usage
Just include `combobo.js`.

```html
<body>
  <script src="node_modules/combobo.js"></script>
  <script>
    var combobo = new Combobox();
  </script>
</body>
```

## Options
* `input` (_HTMLElement|String_): The selector for the input (combobox) element or the input element reference.
  * Defaults to `.combobox`
* `list` (_HTMLElement|String_): The selector for the list element or the list element reference.
  * Defaults to `.listbox`
* `options` (_HTMLElement|String_): The selector for the option elements (qualified within the list) or the option element references.
  * Defaults to `.option`
* `groups` (_Boolean_): Determines whether or not that this option list has optgroups
* `openClass` (_Classname_): Class name that gets added when list is open.
  * Defaults to `open`
* `activeClass` (_Classname_): Class name that gets added when active is triggered
  * Defaults to `active`
* `selectedClass` (_Classname_): Class name that gets added when list item is selected
  * Defaults to `selectedClass`
* `useLiveRegion` (_Boolean_): Determines whether or not to use Live Region (if `false`, `aria-activedescendant` will be used instead)
  * Defaults to `true`
* `multiselect` (_Boolean_): Determines whether or not to enable multiselect features
  * Defaults to `false`
* `noResultsText` (_String_): Sets text for when there are no matches
* `selectionValue` (_Function_): Allows to add customized values for the input upon selection.
* `optionValue` (_Function_): Allows to add customized markup to each option in the list.
* `announcement` (_Function_): Announcement of currently selected items in list. The function accepts 1 argumet which is the number of options selected.
  * Defaults to `function (n) { return n + ' options available'; }`
* `filter` (_String|Function_): String that sets how handle the filter or a function that returns the filtered options.
  * Defaults to `'contains'`
  * Other out-of-the-box options: `'starts-with'`, `'equals'`

### Example Combobo call with options

```js
var combobo = new Combobox({
  input: '.combobox',
  list: '.listbox',
  options: '.option', // qualified within `list`
  groups: null, // qualified within `list`
  openClass: 'open',
  activeClass: 'active',
  selectedClass: 'selected',
  useLiveRegion: true,
  multiselect: false,
  noResultsText: null,
  selectionValue: (selecteds) => selecteds.map((s) => s.innerText.trim()).join(' - '),
  optionValue: (option) => option.innerHTML,
  announcement: (n) => `${n} options available`,
  filter: 'contains' // 'starts-with', 'equals', or funk
});
```

## Events
Add an event listener with `.on`, remove event listener with `.off` (see example below)
* `list:open`: Fires when the list is in an open state.
* `list:close`: Fires when the list is in a closed state.
* `deselection`: Fires when a selected element is deselected.
* `selection`: Fires when an item in the list is selected.
* `change`: Fires after a selection is made.

```js
var combobo = new Combobox();

combobo
  .on('change', function () {
    console.log('stuff has changed and stuff');
  })
  .on('selection', function () {
    console.log('selection made!');
  });
```

## Running tests
```bash
$ gulp test
```
