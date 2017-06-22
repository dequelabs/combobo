# Changes

## 2.4.2

- Fix exit without any report when tests fail (Frederik Ring)

## 2.4.1

- Upgrade `istanbul`, `minimatch` and `through2`

## 2.4.0

- Apply instrumentation in the Browserify pipeline instead of a transform

  This refactoring allow other transforms to modify the source code before instrumentation happens, e.g. the babelify transform.
  Fixes https://github.com/mantoni/mochify.js/issues/116

## 2.3.0

- Support for running in multiple browsers (now the result is the aggregated coverage of all the runs)

## 2.2.2

- Revert defaults for output directory

## 2.2.1

- Fix default istanbul module not found #15

## 2.2.0

- Add support for babel instrumenter #14

## 2.1.2

- Fix for watchify option

## 2.1.1

- Update README usage

## 2.1.0

- Fix critical bug: coverage was reported without waiting for the test to finish
- Now ```exclude``` parameter can be an array. In command line ```--exclude 'pattern1' --exclude 'pattern2'```

## 2.0.0

- First real usable version published in NPM
