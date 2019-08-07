const withCSS = require('@zeit/next-css')
const webpack = require('webpack')

module.exports = withCSS({
  target: 'serverless',
  assetPrefix: '/webapp',
  webpack (config) {
    config.module.rules.push({
      test: /\.(png|svg|eot|otf|ttf|woff|woff2)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          emitFile: true,
          publicPath: '/webapp/_next/static/',
          outputPath: 'static/',
          name: '[name].[ext]'
        }
      }
    })
    config.plugins.push(
      /**
       * IgnorePlugin will skip any require
       * that matches the following regex.
       */
      new webpack.IgnorePlugin(/^encoding$/, /node-fetch/)
    )
    return config
  }
})
