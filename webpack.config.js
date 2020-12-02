const webpack = require('webpack'); 
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    login: ['./resources/script/login/login.js'],
    dashboardPreact: ['./resources/script/dashboard/dashboardPreact.js'],
    editorPreact: ['./resources/script/editorPreact/index.js'],
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
  ],
  resolve: { 
    alias: { 
      "react": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
     // Must be below test-utils
    },
  },
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
          plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-proposal-class-properties']
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