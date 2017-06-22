# stdout and stderr for browsers

Installs `process.stdout` and `process.stderr` and redirects `console` like
node.

Repository: <https://github.com/mantoni/brout.js>

---

## Install with npm

```
npm install brout
```

## Usage

Assume `my-script.js` contains this:

```js
process.stdout.write('Hello stdout!\n');
console.log('Hello %s!', 'console');
```

Use with [browserify][] and [phantomic][]:

```
$ browserify -t brout my-script.js | phantomic
Hello stdout!
Hello console!
```

## API

```js
var brout = require('brout');

brout.on('out', function (str)) {
  // ...
});

brout.on('err', function (str)) {
  // ...
});

brout.on('exit', function (code)) {
  // ...
});
```

Event listeners are tiggered by these calls:

- `process.stdout.write(string)`
- `process.stderr.write(string)`
- `process.exit(code)`

The console functions `log`, `info`, `warn` and `error` get replaced and the
original implementation is exposed:

- `console.log.original`
- `console.info.original`
- `console.warn.original`
- `console.error.original`

The console override behaves like node's implementation and writes to
`process.stdout` and `process.sterr`.

If an `out` or `err` listener is installed, then the corresponding console
message is no longer forwarded to the original console implementation.

## License

MIT

[browserify]: http://browserify.org
[phantomic]: https://github.com/mantoni/phantomic
