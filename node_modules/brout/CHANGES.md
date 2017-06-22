# Changes

## 1.2.0

- Add support for [async call signatures][pull 10] for stream write (cool-Blue)

[pull 10]: https://github.com/mantoni/brout.js/pull/10

## 1.1.1

- Redirect `consol.info` to `stdout` and `console.error` to `stderr` instead of
  aliasing `console.log` and `console.warn` (cool-Blue)

## 1.1.0

Streams 3: Update `through2` to `2.0`

Bump devDependencies:

- `browserify@13.0`
- `mocaccino@1.7`
- `phantomic@1.4`

## 1.0.2

- Update through2 to `^1.1`

## 1.0.1

- Fix transform #1 (Deema Yvanow)
- Bump through2 to 0.6

## 1.0.0

- Use through2 instead of through

## 0.2.0

- Expose emitter as `process._brout`

## 0.1.5

- Don't break on old IE: Provide empty stubs for `log`, `info`, `warn` and
  `error` if console is not there.

## 0.1.4

- Implement `console.trace()`

## 0.1.3

- Log error message to console on `process.exit` if code is not zero

## 0.1.2

- Fixed dependencies

## 0.1.0

- Initial release
