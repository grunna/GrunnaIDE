const webpack = require('webpack'); 
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    editor: ['./resources/script/editor/start.js'],
    dashboard: ['./resources/script/dashboard/dashboard.js']
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/public/script/',
    publicPath: '/script/',
  },
  /*optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },*/
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new CopyPlugin([
      { from: 'node_modules/codemirror/lib', to: '../codemirror/lib' },
      { from: 'node_modules/codemirror/addon', to: '../codemirror/addon' },
      { from: 'node_modules/codemirror/mode', to: '../codemirror/mode' },
      { from: 'node_modules/codemirror/theme', to: '../codemirror/theme' },
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'],
      },
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-runtime']
        }
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
        options: {
          outputPath: '../images',
          publicPath: 'images',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: '../fonts/'
            }
          }
        ],
      },
    ]
  }
}