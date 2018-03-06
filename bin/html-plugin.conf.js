var path = require('path')
var config = require('../config')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')
module.exports = function () {
  var htmlPluginConf = {
    filename: process.env.NODE_ENV === 'production'
      ? config.build.index
      : 'index.html',
    title: config.custom.title || 'vue app',
    template: 'index.ejs',
    favicon: config.favicon,
    inject: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true
      // more options:
      // https://github.com/kangax/html-minifier#options-quick-reference
    },
    // necessary to consistently work with multiple chunks via CommonsChunkPlugin
    chunksSortMode: 'dependency'
  }
  if (config.dll.enable && process.env.NODE_ENV === 'development') {
    htmlPluginConf.dll = Object.keys(config.dll.entry).map(function (entry) {
      var dir = path.join('/static/.dll', entry).replace(/\\/g, '\/') // window下的路径是反斜杠
      return dir + '.js'
    })
  }
  return {
    htmlWebpackPlugin: new HtmlWebpackPlugin(htmlPluginConf),
    htmlWebpackIncludeAssetsPlugin: new HtmlWebpackIncludeAssetsPlugin({
      assets: (function () {
        var externals = config.externals
        var css = config.css
        var arr = []
        var isDev = process.env.NODE_ENV === 'development'
        externals.forEach(function (d) {
          if (!/^(\/static)/g.test(d.path) && !isDev) {
            d._path = d.path.split('/').pop()
            arr.push(path.join(config.build.assetsPublicPath, config.build.assetsSubDirectory, d._path))
          } else {
            arr.push(d.path)
          }
        })
        css.forEach(function (d) {
          if (!/^(\/static)/g.test(d.path) && !isDev) {
            d._path = d.path.split('/').pop()
            arr.push(arr.push(path.join(config.build.assetsPublicPath, config.build.assetsSubDirectory, d._path)))
          } else {
            arr.push(d.path)
          }
        })
        return arr
      })(),
      publicPath: false, // 访问路径前缀
      append: true
    })
  }
}
