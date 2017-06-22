# scrollto-element

[![npm version](https://badge.fury.io/js/scrollto-element.svg)](https://badge.fury.io/js/scrollto-element)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A simple animated scroll to element function.

* Using requestAnimationFrame
* Only require [bezier-easing](https://github.com/gre/bezier-easing) and [raf](https://github.com/chrisdickinson/raf)

## Install

```bash
npm install scrollto-element --save
// or
yarn add scrollto-element
```

## Usage

```javascript
const scrolltoElement = require('scrollto-element')
// or ES2015+
import scrolltoElement from 'scrollto-element'
```

## Example

```javascript
import scrolltoElement from 'scrollto-element'

scrolltoElement(document.querySelector('#foobar'))
scrolltoElement(element, 300)

// advanced
scrolltoElement({
  element: document.querySelector('#foobar'),
  offset: -100, // default is 0
  bezier: [0.19, 1, 0.22, 1], // default is [0.19, 1, 0.22, 1]
  duration: 3000, // default is 100
  then () {
    console.log('Finished~')
  }
})
```

> offset means scroll to (target element + offset).  
When offset is a positive number, view will scroll through the target.  
When offset is a negative number, view will scroll to near the target.

## See also

* [Easing Function Cheat Sheet](http://easings.net/)

## License

MIT
