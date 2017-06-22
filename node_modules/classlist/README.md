# ClassList

Not really an [`Element#classList`][classlist] polyfill. IE9 doesn’t have classList, and other browsers have incomplete implementations; hence, this module.

## Usage

This module is intended for use in the browser via [browserify][browserify]. It can be installed via [npm][npm]:

```
$ npm install classlist
```

And then used like so:

```js
var ClassList = require('classlist')

var element = document.querySelector('.foo'),
    list = ClassList(element)

// Add a class:
list.add('bar')

// Remove another:
list.remove('baz')

// Toggle:
list.toggle('quux')

// Check for existence:
if (list.contains('bar')) {
    alert('Whee')
}
```

## API

This module mostly tracks the [offical API][classlist], but returns the context wherever possible; this allows you to do things like:

```js
ClassList(element)
  .add('foo', 'bar')
  .remove('baz')
  .toggle('quux')
```

### var list = new ClassList(element)

Note that using `new` is optional. Returns an array-like object of the element’s classes. This object has several handy methods; see below.

### list.add(class1 [, class2 [, ... ]])

Adds one or more classes to the element originally used to construct the `list`. If the class is already present on the element, it is not added again. Returns the context to allow chaining.

### list.remove(class1 [, class2 [, ... ]])

Removes one or more classes from the element. Returns the context to allow chaining.

### list.toggle(class [, force ])

Toggles a class on the element; adds the class if it is not present, and removes it otherwise. When `force` is true, the class is always added; when false, the class is removed (i.e. `.toggle(class, true)` is equivalent to `.add(class)`, and `.toggle(class, false)` is equivalent to `.remove(class)`). Returns the context to allow chaining.

### list.contains(class)

Returns true if the element has the given class; false otherwise.

## Browser support

ClassList should work in just about every browser, up to and including IE6. If it doesn’t, [open an issue](https://github.com/lucthev/classlist/issues/new).

## License

MIT.

[classlist]: https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
[browserify]: http://browserify.org/
[npm]: https://www.npmjs.com/
