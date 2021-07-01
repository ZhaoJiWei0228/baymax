var path = require('path')
var _ = require('lodash')
var config = require('../config')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')
var isDev = process.env.NODE_ENV === 'development'

module.exports = function () {
  /**
   * static resource
   * @param {*} externals 
   * @param {*} css 
   */
  function assetInclude(externals, css) {
    var arr = []
    // js
    _.isArray(externals)&& externals.forEach(function (d) {
      var url = d.url 
      if (/^(\/static)/g.test(url) && !isDev) {
        _d = url.split('/').slice(2).join('/')
        arr.push(path.posix.join(config.build.assetsPublicPath, config.build.assetsSubDirectory, _d))
      } else {
        arr.push(url)
      }
    })
    // css
    _.isArray(css) && css.forEach(function (d) {
      if (/^(\/static)/g.test(d) && !isDev) {
        _d = d.split('/').slice(2).join('/')
        arr.push(path.posix.join(config.build.assetsPublicPath, config.build.assetsSubDirectory, _d))
      } else {
        arr.push(d)
      }
    })
    return arr
  }
  
  function htmlPluginConf() {
    var _htmlPluginConf = {
      filename: !isDev ? config.build.index : 'index.html',
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
    if (config.dll.enable && isDev) {
      _htmlPluginConf.dll = Object.keys(config.dll.entry).map(function (entry) {
        var dir = path.join('/static/.dll', entry).replace(/\\/g, '\/')
        return dir + '.js'
      })
    }
    
    if (config.multiEntry) {
      return config.multiEntry.map(function(entry) {
        return new HtmlWebpackPlugin(Object.assign({}, _htmlPluginConf, {
          filename: !isDev ? entry.filename : entry.name + '/index.html',
          title: entry.title,
          template: entry.template,
          favicon: entry.favicon,
          chunks: [ 'manifest', 'vendor', 'commons', entry.name ]
        }))
      })
    }
    return [new HtmlWebpackPlugin(_htmlPluginConf)]
  }

  function htmlIncludeAssetsPluginConf() {
    var _assetPlugin = {
      assets: assetInclude(config.externals, config.css),
      publicPath: false,
      append: false,
      hash: true
    }

    if (config.multiEntry) {
      return config.multiEntry.map(function(entry) {
        return new HtmlWebpackIncludeAssetsPlugin(Object.assign({}, _assetPlugin, {
          files: !isDev ?  path.relative(config.build.assetsRoot, entry.filename) : entry.name + '/index.html',
          assets: assetInclude(entry.externals, entry.css)
        }))
      })
    }
    return [new HtmlWebpackIncludeAssetsPlugin(_assetPlugin)]
  }

  return {
    htmlWebpackPlugin: htmlPluginConf(),
    htmlWebpackIncludeAssetsPlugin: htmlIncludeAssetsPluginConf()
  }
}
