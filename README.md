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
* `input` (_Classname_): Class of the input element.
  * Defaults to `.combobox`
* `list` (_Classname_): Class of the list element.
  * Defaults to `.listbox`
* `options` (_Classname_): Class of each option in the list.
  * Defaults to `.option`
* `groups` (_Boolean_): Determines whether or not that this option list has optgroups
* `openClass` (_Classname_): Class name that gets added when list is open.
  * Defaults to `open`
* `activeClass` (_Classname_): Class name that gets added when active is triggered
  * Defaults to `active`
* `selectedClass` (_Classname_): Class name that gets added when list item is selected
  * Defaults to `selectedClass`
* `useLiveRegion` (_Boolean_): Determines whether or not to use Live Region
  * Defaults to `true`
* `multiselect` (_Boolean_): Determines whether or not to enable multiselect features
  * Defaults to `false`
* `noResultsText` (_String_): Sets text for when there are no matches
* `selectionValue` (_Function_): Allows to add customized views for multiselected items for input.
* `optionValue` (_Function_): Allows to add customized highlighting features to each option that matches
* `announcement` (_Function_): N/A
* `filter` (_String_): String that sets how handle the filter
  * Defaults to contains
  * Other options: 'starts-with', 'equals', or funk

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

## Events TODO
Add an event listener with `.on`, remove event listener with `.off` (see example below)
* `list:open`:
* `list:close`:
* `deselection`:
* `selection`:
* `change`:

```js TODO:
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
