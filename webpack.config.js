const path = require('path');

module.exports = {
  entry: '.',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: path.resolve(__dirname, 'node_modules'),
    }],
  },

  devServer: {
    historyApiFallback: true,
    port: 8087,
  },
};
