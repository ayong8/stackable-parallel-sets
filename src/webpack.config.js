/* global __dirname */

var path = require('path');

var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var dir_js = path.resolve(__dirname, 'js');
var dir_html = path.resolve(__dirname, 'html');
var dir_build = path.resolve(__dirname, 'build');
var dir_css = path.resolve(__dirname, 'css');
var dir_lib = path.resolve(__dirname, 'lib');

module.exports = {
  entry: [
    path.resolve(dir_js, 'index.js'), 
    path.resolve(dir_lib, 'bootstrap_submenu.js'),
    // path.resolve(dir_lib, './bootstrap_submenu/css/bootstrap_submenu.css'),
    'babel-polyfill'
  ],
  output: {
    path: dir_build,
    filename: 'bundle.js'
  },
  devServer: {
    publicPath: '/',
    contentBase: dir_html,
    hot: true,
    proxy: {
      '/dataset/**': {
        target: 'http://localhost:8008',
        secure: false,
        changeOrigin: true,
      }
    }
  },
  module: {
    // rules: [
    //   {
    //     test: dir_js,
    //     use: ['babel-loader']
    //   },
    //   {
    //     test: /\.css$/,
    //     use: ['css-loader', 'style-loader']
    //   },
    //   {
    //     test: /\.json$/,
    //     use: ['json-loader']
    //   }
    // ],
    loaders: [
      {
        loader: 'babel-loader',
        test: dir_js
      },
      {test: /\.json$/, loader: 'json-loader'},
      {
        test: dir_css,
        loader: 'style-loader'
      },
      {
        test: dir_css,
        loader: 'css-loader'
      }
    ]
  },
  plugins: [
    // // Simply copies the files over
    // new CopyWebpackPlugin([
    //   {from: dir_html} // to: output.path
    // ]),
    // Avoid publishing files when compilation fails
    new webpack.NoErrorsPlugin()
  ],
  stats: {
    // Nice colored output
    colors: true
  },
  // Create Sourcemaps for the bundle
  devtool: 'eval-source-map'
};
