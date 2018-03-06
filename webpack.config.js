const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const isProd = process.env.NODE_ENV === 'production';
const plugins = [];

if (isProd) {
  plugins.push(new UglifyJSPlugin());
  plugins.push(new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }));
}

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'combobo.js',
    library: 'Combobo',
    libraryTarget: 'umd'
  },
  module: {
   rules: [
     {
       test: /\.js$/,
       exclude: /node_modules/,
       loader: 'babel-loader'
     }
   ]
 },
 plugins: plugins
};
