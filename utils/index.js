var _ = require('lodash')
var chalk = require('chalk')
var figures = require('figures')
var path = require('path')
var config = require('../config')
var MiniCssExtractPlugin = require("mini-css-extract-plugin")
var resolve = path.resolve
var sep = path.sep
var relative = path.relative

var reqSep = /\//g
var sysSep = _.escapeRegExp(sep)
var normalize = string => string.replace(reqSep, sysSep)

function wp(p) {
	if (/^win/.test(process.platform)) {
	  p = p.replace(/\\/g, '\/')
	}
	return p
}

function r(p) {
	return wp(resolve(normalize(p)))
}

function relativeTo(dir, p) {
	// Resolve path
	var path = r(p)
	// Make correct relative path
	var rp = relative(dir, path)
	if (rp[0] !== '.') {
	  rp = './' + rp
	}
	return wp(rp)
  }

exports.wp = wp

exports.r = r

exports.relativeTo = relativeTo

exports.resolve = function () {
  var dir = path.join.apply(null, arguments)
  return path.join(process.cwd(), dir)
}
exports.assetsPath = function (_path) {
  
  var assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  var postcssLoader = {
    loader: 'postcss-loader'
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders(loader, loaderOptions) {
    var loaders = [ cssLoader, postcssLoader ]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return [MiniCssExtractPlugin.loader].concat(loaders)
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}

exports.clearTerminal = function () {
  process.stdout.write('\033c')
}

function output(module, msg, figure = figures.bullet) {
  console.log([chalk.green(figure), chalk.green('[baymax] ' + module), msg].join(' '))
}

exports.log = function (module, msg, figure) {
  output(module, msg, figure)
}

exports.done = function (module, msg) {
  output(module, msg, figures.tick)
}

exports.success = function (module, msg) {
  output(module, chalk.green(msg), figures.radioOn)
}

exports.warnig = function (module, msg) {
  output(module, chalk.yellow(msg))
}

exports.fail = function (module, msg) {
  output(module, chalk.red(msg))
  process.exit(1)
}
