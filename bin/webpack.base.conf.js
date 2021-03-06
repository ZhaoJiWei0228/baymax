var path = require('path')
var _ = require('lodash')
var webpack = require('webpack')
var config = require('../config')
var utils = require('../utils')
var vueLoaderConfig = require('./vue-loader.conf')
var StyleLintPlugin = require('stylelint-webpack-plugin')
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
var VueLoaderPlugin = require('vue-loader/lib/plugin')
var htmlPluginConf = require('./html-plugin.conf')
var WebpackBar = require('webpackbar') //

var customExts = config.custom.extensions || []
var uniqExtensions = function (defaultExts, exts) {
  return _.uniq(defaultExts.concat(exts))
}
var context = process.cwd()

function entry() {
  if (config.multiEntry) {
    // add multi-entry support
    if (!_.isArray(config.multiEntry)) {
      utils.fail('webpack', 'multiEntry value should be array')
    }
    var ret = {}

    config.multiEntry.forEach(function(entry) {
      ret[entry.name] = entry.entry
    })
    return ret
  }
  return {
    app: config.entry
  }
}

var webpackConf = {
  context: context,
  entry: entry(),
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    modules: [path.resolve(__dirname, '../', 'node_modules'), 'node_modules'],
    extensions: uniqExtensions(['.js', '.vue', '.json'], customExts),
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
      conf[ item.var ] = item.package
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
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin(config.define),
    new WebpackBar({
      name: '[baymax] webpack',
      color: 'green',
      compiledIn: false
    })
  ]
}

if (config.typescript) {
  webpackConf.resolve.extensions = uniqExtensions(webpackConf.resolve.extensions, ['.ts', '.tsx'])
  webpackConf.module.rules.unshift(
    {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      enforce: 'pre',
      loader: 'tslint-loader'
    },
    {
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [
        "babel-loader",
        {
          loader: "ts-loader",
          options: { 
            transpileOnly: true,
            appendTsxSuffixTo: [/\.vue$/] 
          }
        }
      ]
    }
  )
  webpackConf.plugins.push(new ForkTsCheckerWebpackPlugin())
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

if (typeof config.custom.providers === 'object' && Object.keys(config.custom.providers).length) {
  webpackConf.plugins.push(new webpack.ProvidePlugin(
    config.custom.providers
  ))
}
var plugins = htmlPluginConf()
webpackConf.plugins.push(...plugins.htmlWebpackPlugin)
webpackConf.plugins.push(...plugins.htmlWebpackIncludeAssetsPlugin)
module.exports = webpackConf
