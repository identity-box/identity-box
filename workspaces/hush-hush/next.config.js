module.exports = {
  env: {
    serviceUrl: {
      development: 'http://localhost:3000',
      production: 'https://idbox-queue.now.sh'
    },
    telepath: {
      idbox: {
        id: process.env.hush_hush_telepath_idbox_id,
        key: process.env.hush_hush_telepath_idbox_key,
        appName: process.env.hush_hush_telepath_idbox_appname,
        servicePointId: process.env.hush_hush_telepath_idbox_servicepointid
      }
    }
  },
  // assetPrefix: '/hush-hush',
  webpack (config) {
    config.module.rules.push({
      test: /\.(png|svg)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          publicPath: '/_next/static/',
          outputPath: 'static/',
          name: '[name].[ext]'
        }
      }
    })
    return config
  }
}
