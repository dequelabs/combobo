# Changes

## 1.5.2

- Catch `SyntaxError` exceptions

## 1.5.1

- Normalizes casing of options (#17) (Frederik Ring)

## 1.5.0

- Add option to pass viewport height and width to phantomjs (#16) (Frederik Ring)
- Add PhantomJS 2.0 to compatibility section
- Fix timezone tests to also work with DST
- Fix URL to git repo (Ivan Goncharov)
- Use [@studio/changes][] to automate the release process

[@studio/changes]: https://github.com/javascript-studio/studio-changes

## 1.4.0

- Bump `source-mapper` to `^2.0.0`
- Bump `cross-spawn` to `^2.1.4`
- Test against `browserify@13`

## 1.3.0

- Set phantomjs timezone to environment `TZ` (Fabio El Manchi)
- Wait a little longer for log messages

## 1.2.0

- Add `--ignore-ssl-errors` option (Adrian Chang)

## 1.1.2

- Remove dependency on `through` by using PathThrough streams

## 1.1.1

- Prevent the page from navigating after the initial page is loaded (Arnout
  Kazemier)

## 1.1.0

- Add `--web-security` option to toggle PhantomJS web security (Jacob Waller)

## 1.0.3

- Fix spawning on windows (Deema Yvanow)

## 1.0.2

- Work around [issue with PhantomJS 1.9.8](https://github.com/ariya/phantomjs/issues/12697)

## 1.0.1

- Disable timeouts on the http server. Fixes an issue with leaking PhantomJS
  processes.

## 1.0.0

- Bump source-mapper and es5-shim

## 0.10.2

- Tiny performance improvement

## 0.10.1

- Close http server

## 0.10.0

- Bump source-mapper

## 0.9.0

- Moved source mapping logic into new source-mapper module

## 0.8.2

- Fix urls in error traces if flags where passed

## 0.8.1

- Remove console statement when running a file
- Improve docs for command line and API usage

## 0.8.0

- Support for non-global install of phantomjs

## 0.7.5

- Fix stale phantomjs instance when piping an empty script with --brout

## 0.7.4

- Launch http server and phantomjs while waiting for input stream

## 0.7.3

- Bump es5-shim

## 0.7.2

- Improve error handling if Phantom.JS cannot be found

## 0.7.1

- Wait for phantomjs output streams to end

## 0.7.0

- Add `--brout` support for [brout][] specific stdio/exit handlers

## 0.6.2

- Fix issue in conjunction with Sinon.JS by making the "done" checker immune
  against `setTimeout` overrides

## 0.6.1

- Exit phantom in debug mode

## 0.6.0

- Experimental debugger support (`--debug`)
- Use random free port by default
- Allow to specify a port number (`--port`)
- Run script from a file instead of stdin
- Improved 'done' detection

## 0.5.0

- Always load es5-shim (Andrey Popp)

## 0.4.4

- Set source-map dependency to 0.1.32 because the source maps support breaks
  with 0.1.33. <https://github.com/mozilla/source-map/issues/101>

## 0.4.3

- Fixup uncaught error trace with source maps. Fixes #2

## 0.4.2

- Make scripts without sourcemaps work again

## 0.4.1

- Use embedded source maps to repair stack traces

## 0.4.0

- API returns output stream
- Improved output capturing and async script handling

## 0.3.0

- Added API

[brout]: https://github.com/mantoni/brout.js
