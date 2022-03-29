# Combobo

[![CircleCI](https://circleci.com/gh/schne324/combobo.svg?style=svg)](https://circleci.com/gh/schne324/combobo)

Accessible combobox module

## Installation

```bash
$ npm install combobo
```

## Usage

### In the browser
Just include `combobo.js` (`window.Combobo` will be set)

```html
<body>
  <script src="./node_modules/combobo/dist/combobo.js"></script>
  <script>
    var combobo = new Combobo();
  </script>
</body>
```

#### CDN (unpkg)

```html
<script src="https://unpkg.com/combobo"></script>
```

### With browserify/webpack/any bundler

```js
import Combobo from 'combobo'; // or require('combobo')

const combobo = new Combobo();
```

## Options
* `input` (_HTMLElement|String_): The selector for the input (combobox) element or the input element reference.
  * Defaults to `.combobox`
* `list` (_HTMLElement|String_): The selector for the list element or the list element reference.
  * Defaults to `.listbox`
* `options` (_Array|String_): An array of HTMLElements or a string selector (to be qualified within the list element).
  * Defaults to `.option`
* `groups` (_Array|String_): An array of HTMLElements or a string selector (to be qualified within the list element)
* `openClass` (_String_): Class name that gets added when list is open.
  * Defaults to `open`
* `activeClass` (_String_): Class name that gets added when active is triggered
  * Defaults to `active`
* `selectedClass` (_String_): Class name that gets added when list item is selected
  * Defaults to `selectedClass`
* `allowEmpty` (_Boolean_): If completely clear selection should be allowed (if field is required, `false` is probably what you want).
  * Defaults to `true`
* `useLiveRegion` (_Boolean_): Determines whether or not to use Live Region (due to spotty AT support, `aria-activedescendant` will be used also).  As of right now, it is recommended that you leave `useLiveRegion` on due to VoiceOver's lack of support for `aria-activedescendant`.
  * Defaults to `true`
* `multiselect` (_Boolean_): Determines whether or not to enable multiselect features
  * Defaults to `false`
* `noResultsText` (_String_): Sets text for when there are no matches
* `selectionValue` (_Function_): A function that should return what the desired value of the input should be upon selection (this is especially useful for multiselect in that you can configure custom input values like `{3 Items Selected}`). An array of the selected options is passed as the one argument to the function.
* `optionValue` (_Function|String_): A function that should return the desired markup of each option in the list (this allows for custom display of each option based on what is currently typed in the field) OR a string class that is to be added to the span that will be wrapped around the matched text in each option.
* `announcement` (_Object_): An object containing the following properties:
  * `count` (_Function_): Announcement of currently selected items in list. The function accepts 1 argument which is the number of options selected.
    * Defaults to `function (n) { return n + ' options available'; }`
  * `selected` (_String_): The desired text to be used to inform AT that an option is selected (This is only applicable if useLiveRegion is `true`)
    * Defaults to `"Selected."`
  * `groupChange` (_Function_): The desired text to be announced when a group change occurs (as a result of arrow-key traversal of options).  This is obviously only applicable if `groups` are used (see above for info on `options.groups`)
    * Example:
    ```js
      function groupChangeHandler(newGroup) {
        var groupLabel = newGroup.querySelector('.optgroup-label').innerText;
        var len = Array.prototype.slice.call(
          newGroup.querySelectorAll('.option')
        ).filter(function (opt) {
          return opt.style.display !== 'none';
        }).length;

        return groupLabel + ' group entered, with ' + len + ' options.';
      }
    ```
* `filter` (_String|Function_): A filter-type string (`'contains'`, `'starts-with'`, or `'equals'`) or a function that returns a array of filtered options.
  * Defaults to `'contains'`
* `onPageFilter` (_Boolean_): To enable / disable filterng options on front end. If the developer wants to filter options from the server, then it should be false
  * Defaults to `'true'`


### Example Combobo call with options

```js
var combobo = new Combobo({
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
  optionValue: 'underline', // wrap the matched portion of the option (if applicable) in a span with class "underline"
  announcement: {
    count: (n) => `${n} options available`,
    selected: 'Selected.'
  },
  filter: 'contains' // 'starts-with', 'equals', or funk,
  onPageFilter: 'true' // 'true' or 'false' default true
});
```

## Events
Add an event listener with `.on`, remove event listener with `.off` (see example below)
* `list:open`: Fires when the list is in an open state.
* `list:close`: Fires when the list is in a closed state.
* `deselection`: Fires when a selected element is deselected.
* `selection`: Fires when an item in the list is selected.
* `change`: Fires each time an option is made active (either through arrow key traversal or hover).

```js
var combobo = new Combobo();

combobo
  .on('change', function () {
    console.log('stuff has changed and stuff');
  })
  .on('selection', function () {
    console.log('selection made!');
  });
```

## Methods
* `goTo`: accepts 1 argument which is either a *String* ('prev' or 'next'), which as it sounds will navigate Combobo to the previous or next option, or the index (*Number*) of the option to be traversed to.  NOTE: This method does not select the option but rather highlights it as if the option is hovered or arrowed to.
* `select`: selects the currently highlighted option
* `getOptIndex`: returns the index (within the currently visible options) of the currently selected option.
* `reset`: clears the filters and deselects any currently selected options.
* `setOptions`: accepts 1 argument which is HTML code in *String* format. Adds one option to the existing dropdown list.
* `setNoResultFound`: shows the *No results found* in dropdown if the matching options not available
* `emptyDropdownList`: Empty the options in the dropdown list
* `updateSelectedOptions`: Empty all the options and update with selected options in the list
* `setCurrentOptions`: Sets the current Option from the current options list 

### Example usage

```js
// move 5 options forward and select the option
combobo
  .goTo(combobo.getOptIndex() + 5)
  .select();

// adds an option to the dropdown list
combobo
  .setOptions(`<li>Some Option</li>`);
```
