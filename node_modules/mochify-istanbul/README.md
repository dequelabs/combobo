mochify-istanbul [![travis status](https://travis-ci.org/ferlores/mochify-istanbul.svg?branch=master)](https://travis-ci.org/ferlores/mochify-istanbul)
=====================
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/ferlores/mochify-istanbul?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Add [istanbul](https://github.com/gotwarlost/istanbul) coverage to the [mochify.js](https://github.com/mantoni/mochify.js) pipeline.

## Install

```
$ npm install mochify mochify-istanbul
```

## Usage

```javascript
var mochify = require('mochify');
var istanbul = require('mochify-istanbul');

va b = mochify('path/to/your/file', mochifyOpts)
  .plugin(istanbul, {
    // Plugin options
    instrumenter: 'babel-istanbul',
    // Instrumenter options
    exclude: ['**/test/**/*', '**/node_modules/**/*'],
    // Reporter options
    report: ['text', 'cobertura', 'json'],
    dir: './coverage'
  })
  .bundle();
```

## Options
There are only three options specific to this module, all the rest options are passed directly to the reporters
* ```options.instrumenter = 'instrumenter-module'```: This specifies the
  istanbul-compatible instrumenter to use. By default this is `istanbul`
  itself, but one might specify `babel-istanbul` to instrument ES6 code.
* ```options.exclude = '<glob pattern>' || ['<glob pattern>']```: Files to exclude for the instrumenter. **Note** that all the exclude pattern should start with '**/' since the matching is done using the absoulte path for the files.
* ```options.report = ['<report type>']```: Array of reports to generate. Check [istanbul](https://github.com/gotwarlost/istanbul) for a updated list of reports

## Command line usage

``` bash
$ mochify --plugin [ mochify-istanbul --exclude '**/+(test|node_modules)/**/*' --report json  \
   --report cobertura --dir ./coverage ] test.js
```

## Compatibility
 - Node >= 0.10
 - v0.x, v1.0, v2.0
    - Mochify 2.x
        - Browserify 6.x
        - Mocha 2.x
        - Istanbul 0.x

## Run tests
Clone the repo and run ```npm install && npm test```

## License

(The MIT License)

Copyright (c) 2012 Fernando Lores <ferlores@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
