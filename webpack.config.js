const webpack = require('webpack'); 

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