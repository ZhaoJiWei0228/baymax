var path = require('path')
var _ = require('lodash')
var webpack = require('webpack')
var utils = require('../utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
var StyleLintPlugin = require('stylelint-webpack-plugin')
var htmlPluginConf = require('./html-plugin.conf')

var customExts = config.custom.extensions || []
var uniqExtensions = function (defaultExts, exts) {
  return _.uniq(defaultExts.concat(exts))
}
var context = process.cwd()

var webpackConf = {
  context: context,
  entry: {
    app: config.entry
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
	modules: [path.resolve(__dirname, '../', 'node_modules'), 'node_modules'],
    extensions: uniqExtensions([ '.js', '.vue', '.json' ], customExts),
    alias: Object.assign({
      'vue$': 'vue/dist/vue.esm.js'
    }, config.custom.alias)
  },
  resolveLoader: {
	  modules: [path.resolve(__dirname, '../', 'node_modules'), 'node_modules']
  },
  externals: (function () {
    var conf = {}
    config.externals.forEach(function (item) {
      conf[ item.package ] = item.var
    })
    return conf
  })(),
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [ utils.resolve('src'), utils.resolve('test') ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(html|tpl)$/,
        loader: 'html-loader',
        options: {
          attrs: [ ':src', ':data-src' ]
        }
      }
    ]
  },
  plugins: []
}

if (config.custom.eslint && config.custom.eslint.enable) {
  webpackConf.module.rules.unshift({
    test: config.custom.eslint.test || /\.(js|vue)$/,
    loader: 'eslint-loader',
    enforce: 'pre',
    include: [ utils.resolve('src'), utils.resolve('test') ],
    options: {
      formatter: require('eslint-friendly-formatter')
    }
  })
}

if (config.custom.stylelint) {
  webpackConf.plugins.push(new StyleLintPlugin({
    configFile: '.stylelintrc',
    context: utils.resolve('src'),
    files: [ '**/*.less', '**/*.vue' ],
    syntax: 'less'
  }))
}

if (
  typeof config.custom.providers === 'object' &&
  Object.keys(config.custom.providers).length
) {
  webpackConf.plugins.push(new webpack.ProvidePlugin(
    config.custom.providers
  ))
}
var plugins = htmlPluginConf()
webpackConf.plugins.push(plugins.htmlWebpackPlugin)
webpackConf.plugins.push(plugins.htmlWebpackIncludeAssetsPlugin)
module.exports = webpackConf
