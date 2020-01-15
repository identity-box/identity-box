const withCSS = require('@zeit/next-css')
const webpack = require('webpack')

module.exports = withCSS({
  target: 'serverless',
  env: {
    serviceUrl: {
      development: 'http://localhost:3000',
      production: 'https://idbox-queue.now.sh'
    },
    telepath: {
      idbox: {
        id: '@hush_hush_telepath_idbox_id',
        key: '@hush_hush_telepath_idbox_key',
        appName: '@hush_hush_telepath_idbox_appname',
        clientId: '@hush_hush_telepath_idbox_clientid',
        servicePointId: '@hush_hush_telepath_servicepointid'
      }
    }
  },
  assetPrefix: '/hush-hush',
  webpack (config) {
    config.module.rules.push({
      test: /\.(png|svg|eot|otf|ttf|woff|woff2)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          emitFile: true,
          publicPath: '/hush-hush/_next/static/',
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
