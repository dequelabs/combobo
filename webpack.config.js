const path = require('path');

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
 }
};
