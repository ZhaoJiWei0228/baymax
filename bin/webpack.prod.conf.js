var path = require('path')
var _ = require('lodash')
var utils = require('../utils')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var UglifyJsPlugin = require("uglifyjs-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin')
var MiniCssExtractPlugin = require("mini-css-extract-plugin")
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var PreloadWebpackPlugin = require('preload-webpack-plugin');

/**
 * copy asset, include js,css
 */
function getCopyAssets () {
  var externals = config.externals
  var css = config.css
  var arr = []
  externals.forEach(function (d) {
    if (!/^(\/static|http|https)/g.test(d.url)) {
      arr.push({
        from: utils.resolve(d.url),
        to: path.resolve(config.build.assetsRoot, config.build.assetsSubDirectory),
        ignore: [ '.*' ]
      })
    }
  })
  css.forEach(function (d) {
    if (!/^(\/static|http|https)/g.test(d)) {
      arr.push({
        from: utils.resolve(d),
        to: path.resolve(config.build.assetsRoot, config.build.assetsSubDirectory),
        ignore: [ '.*' ]
      })
    }
  })
  return arr
}

var webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[name].[chunkhash].js')
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: {
      name: 'manifest'
    },
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSPlugin({
        cssProcessorOptions: {
          safe: true,
          autoprefixer: {
            add: false,
            remove: false
          }
        }
      })
    ],
    removeEmptyChunks: true
  },
  plugins: [
    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[chunkhash].css'),
      chunkFilename: utils.assetsPath('css/[name].[chunkhash].css')
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: utils.resolve('static'),
        to: path.resolve(config.build.assetsRoot, config.build.assetsSubDirectory),
        ignore: [ '.*', '.dll/**' ]
      }
    ].concat(getCopyAssets()))
  ]
}, config.custom.build)

// enable Gzip
if (config.build.productionGzip) {
  var CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}
// enable Preload
if (config.build.preload) {
  webpackConfig.plugins.push(new PreloadWebpackPlugin(_.isPlainObject(config.build.preload) ? config.build.preload : {}))
}
 
module.exports = webpackConfig
