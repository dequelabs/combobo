# Changes

## 2.0.0

- Upgrade Mocha to `^3.2` (Morgan Roderick)
- Order dependencies by using `npm` command (Morgan Roderick)

    This will make future changesets made with `npm install` read much better,
    as `npm` commands always sorts dependencies lexicographically.

- Run tests in newer node versions, and remove 0.10, 0.12 (#21) (Morgan
  Roderick)
- Use `@studio/changes` instead of make

## 1.9.0

- Add support for `reporterOptions` in API (Tomer Lahav)
- Update Mocha link (Morton Fox)

## 1.8.2

Revert "Nail Mocha to `~2.3.4` to workaround issues with `2.4.x`" since the
underlying issue was reverted in Mocha.

## 1.8.1

Nail Mocha to `~2.3.4` to workaround issues with `2.4.x`.
Follow <https://github.com/mantoni/mochify.js/issues/129> for updates.

## 1.8.0

Streams 3: bump dependencies so that `through2@2` is used everywhere.

These dependencies have been updated:

- `through2: ^2.0.0`
- `resolve: ^1.1.6`
- `brout: ^1.1.0`
- `supports-color: ^3.1.2`

Test are now using `browserify@13`.

## 1.7.0

Brad Buchanan fixed the `grep` behavior to align better with Mocha. See
[pull request #16](https://github.com/mantoni/mocaccino.js/pull/16).

> Adds the ability to pass the Mocha fgrep option through, so that any users
> who were depending on the incorrect behavior of `--grep` before can easily
> switch over to `fgrep` (which is what they want).

- Treat `grep` option as a regular expression. (Brad Buchanan)
- Add `fgrep` option. (Brad Buchanan)

## 1.6.1

- Bump Mocha version to use at least 2.3.0 (Matheus Kautzmann)

## 1.6.0

- Add support for third party reporters (Matheus Kautzmann)
- Move mocha from `devDependencies` to `dependencies`

## 1.5.2

- Update through2 to `^1.1`

## 1.5.1

- Improve documentation
- Add node 0.12 to travis config

## 1.5.0

- Add options `--colors` and `--no-colors` to explicitly enable or disable colors
- Fix setting colors

## 1.4.0

- Use same color feature detection as introduced in Mocha 2.2

## 1.3.0

- Allow to override the window width

## 1.2.0

- Add support for grep invert option (Daniel Davidson)

## 1.1.0

- Add support for mocha `grep` option (Daniel Davidson)

## 1.0.7

- Set window width and dot symbol for node as well

## 1.0.6

- Bump through2, resolve and phantomic
- Fix coverage for browsers

## 1.0.5

- Fix for calling `b.bundle()` multiple times

## 1.0.4

- Listen to Browserify 'reset' events

## 1.0.3

- Fix brout resolution for Windows

## 1.0.2

- Fix issue with multiple push calls to through2

## 1.0.1

- Fix brout resolving

## 1.0.0

- Require Browserify 5

## 0.8.0

- Added `timeout` and `t` options so one can test async scripts that last longer than `2000ms`

## 0.7.0

- Added `ui` and `U` options so one can select BDD/TDD/QUnit (Mikela Clemmons)

## 0.6.4

- Use `process.nextTick` to yield instead of `setTimeout`

## 0.6.3

- Support `require('mocha')`

## 0.6.2

- Lame cygwin thing with `getWindowSize`

## 0.6.1

- Pass on terminal window width
- Use ascii dot symbol for compatibility

## 0.6.0

- Bump [brout][] and verify [phantomic][] can be used with `--brout`
- Fix path to setup file on windows

## 0.5.0

- Yield every 250 milliseconds by default to allow pending I/O to happen
- Add `--yields` / `-y` option to configure yield interval

## 0.4.2

- Allow to use Mocaccino output in a browser with [coverify][]

## 0.4.1

- Fix `describe.only` and `it.only` (Andrey Popp)

## 0.4.0

- Include Mocha via Browserify (Andrey Popp)
- Remove `Function.prototype.bind` shim since Phantomic 0.5 always includes
  es5-shim (Andrey Popp)

## 0.3.1

Don't screw up [coverify][] output

## 0.3.0

Rewrote Mocaccino as Browserify plugin

## 0.2.1

Resolve Mocha properly

## 0.2.0

Support most Mocha reporters when used with `brout`

- Removed mocaccino-reporter
- Using "tap" as the default reporter because it works with standard
  `console.log` statements
- Adding in browser shims for `Array.forEach` and `Function.bind`
- Using `process.exit(code)` on finish if available

## 0.1.0

Initial release

[coverify]: https://github.com/substack/coverify
[brout]: https://github.com/mantoni/brout.js
[phantomic]: https://github.com/mantoni/phantomic
