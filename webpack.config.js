var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  entry: ["@babel/polyfill", "./src/index.js"],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index_bundle.js'
  },
  module:{
      rules:[
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            } 
          }
      ]
  },
  devServer:{
      proxy:{
        '/report/bi/dashboard/': {
            target: 'https://portal.ukritter.ru',
            secure: false
        }
      }
  },
  plugins: [new HtmlWebpackPlugin(
      {
          template: './src/index.html'
      }
  )]
};