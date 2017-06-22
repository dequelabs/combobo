const path = require('path')
const webpack = require('webpack')

const exclude = /(node_modules|bower_components)/

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'scrollto-element.js',
    library: 'scrolltoElement',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js$/,
      loader: 'standard-loader',
      exclude
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      options: { cacheDirectory: true },
      exclude
    }]
  }
}
