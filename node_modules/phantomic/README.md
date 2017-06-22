# Phantomic

[![SemVer]](http://semver.org)
[![License]](https://github.com/mantoni/phantomic/blob/master/LICENSE)

- Pipes stdin to [PhantomJS](http://phantomjs.org)
- Writes script console output to stdout
- Writes script errors to stderr
- Exit code 0 if nothing threw, otherwise 1

## Install

```
npm install -g phantomic
```

## Usage

Phantomic does not include PhantomJS itself. Make sure the `phantomjs`
executable is in your `PATH` or specify with `--phantomjs`.

```
Usage: phantomic [options] [file]

Options:
    --debug                Launch the WebKit debugger in a browser
    --port <num>           Explicit port binding for temporary web server. If
                           no port is specified, a random free port is used.
    --phantomjs <path>     Use specified phantomjs binary
    --web-security <bool>  Enables PhantomJS web security and forbids
                           cross-domain XHR (default is true)
    --brout                Assume brout is part of the JS
    --ignore-ssl-errors <bool>  Tell PhantomJS to ignore SSL certificate errors
                                when network requests are made (default is false)
    --viewport-width <num>      Tell PhantomJS about the desired viewport width
    --viewport-height <num>     Tell PhantomJS about the desired viewport
                                height

```

Pipe any script to phantomic:

```
phantomic < ./test.js
```

Opening a file:

```
phantomic ./test.js
```

If you are using phantomic from a Makefile with a local install, you will have
to include it in the PATH:

```
BIN = ./node_modules/.bin
PATH := $(BIN):$(PATH)

test:
  browserify ./test.js | phantomic
```

## Debugging

Put a `debugger;` statement somewhere and run:

```
phantomic --debug < ./test.js
```

This will open the WebKit inspector in your browser.

## Exit detection

By default, phantomic will report an error if anything was logged to
`console.error`. Program termination is detected by observing delays in the
event queue and the last log statement that was received.

To make exit detection more reliable, [brout][] can be used. If brout is part
of the given script, run phantomic with `--brout` to install handlers for the
`out`, `err` and `exit` events. Also make sure `process.exit(code)` is called.

## API

You can use phantomic from your own node scripts like this:

```js
var phantomic = require('phantomic');

phantomic(process.stdin, {
  debug : false,
  port  : 0,
  brout : false,
  'web-security': false,
  'ignore-ssl-errors': true,
  'viewport-width': 1024,
  'viewport-height': 768
}, function (code) {
  process.exit(code);
}).pipe(process.stdout);
```

## Run the test cases

```
npm install
make
```

## Compatibility

- Node 0.10 or later
- PhantomJS 1.9 / 2.0

## License

MIT

[SemVer]: http://img.shields.io/:semver-%E2%9C%93-brightgreen.svg
[License]: http://img.shields.io/npm/l/phantomic.svg
[brout]: https://github.com/mantoni/brout.js
