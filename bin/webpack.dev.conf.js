var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var config = require('../config')
var utils = require('../utils')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[ name ] = [ path.resolve(__dirname, './dev-client') ].concat(baseWebpackConfig.entry[ name ])
})
var plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new FriendlyErrorsPlugin()
]

if (config.dll.enable) {
  var entry = config.dll.entry
  for (var key in entry) {
    plugins.push(new webpack.DllReferencePlugin({
      manifest: require(path.resolve(config.dll.outputPath, key + '.manifest.json'))
    }))
  }
}

module.exports = merge(baseWebpackConfig, {
  mode: 'development',
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  optimization: {
    runtimeChunk: false,
    minimize: false,
    noEmitOnErrors: true,
    splitChunks: false
  },
  devtool: config.dev.devtool,
  plugins: plugins
}, config.custom.dev)
