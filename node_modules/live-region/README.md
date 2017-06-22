# LiveRegion

Creates a configurable offscreen live region.

## Installation
### NPM
```bash
$ npm install live-region
```

### Bower
```bash
$ bower install live-region
```

## Usage
```js
var liveRegion = new LiveRegion();
liveRegion.announce('Hello Fred');
```
This will create an offscreen live region:
```html
<div role="log" aria-live="polite" aria-relevant="additions" aria-atomic="false"></div>
```

### Browserify
```js
var LiveRegion = require('live-region');
var liveRegion = new LiveRegion();
```

## Configuration
```js
var assertive = new LiveRegion({
  ariaLive: 'assertive',
  role: 'log',
  ariaRelevant: 'all',
  ariaAtomic: 'true'
});
```
### Options
- `ariaLive` (_String_): `"polite"` or `"assertive"` - the desired value of the `aria-live` attribute. Defaults to `"polite"`.
- `role` (_String_): `"status"`, `"alert"`, or `"log"` - the desired value of the `role` attribute. Defaults to `"log"`.
- `ariaRelevant` (_String_): `"additions"`, `"removals"`, `"text"`, `"all"`, or `"additions text"` - the desired value of the `aria-relevant` attribute. Defaults to `"additions"`.
- `ariaAtomic` (_String_): `"true"` or `"false"` - the desired value of the `aria-atomic` attribute. Defaults to `"false"`.

## Methods

### `LiveRegion#announce`
- *@param* `message` (_String_): the message to be announced
- *@param* `expire` (_Number_): the number of ms to wait before cleaning up the inserted message. This prevents the region from getting full of useless nodes.  Defaults to `7000`.  *NOTE*: to prevent the announcements from expiring, set to `false`.
```js
region.announce('Hello Fred', 5e3);
```
