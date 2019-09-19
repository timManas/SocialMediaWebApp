

// Any additional features we need to use

const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './frontend-js/main.js',       // We want to tell Webpack where our files live
  output: {
    filename: 'main-bundled.js',
    path: path.resolve(__dirname, 'public')     // We want to tell Webpack where to bundle or export our files too
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}