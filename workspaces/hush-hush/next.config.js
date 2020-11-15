module.exports = {
  assetPrefix: '/hush-hush',
  webpack (config) {
    config.module.rules.push({
      test: /\.(png|svg)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          publicPath: '/hush-hush/_next/static/',
          outputPath: 'static/',
          name: '[name].[ext]'
        }
      }
    })
    return config
  }
}
