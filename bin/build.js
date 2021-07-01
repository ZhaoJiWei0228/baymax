require('./check-versions')()
process.env.NODE_ENV = 'production'
var _ = require('lodash')
var rm = require('rimraf')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var config = require('../config')
var generateRouter = require('./generate-router')
var webpackConfig = require('./webpack.prod.conf')

run()

async function run() {
  try {
    if (! _.isArray(config.multiEntry)) {
      generateRouter()
    }
    await removeOldFiles()
    await runWebpack()
  } catch (e) {
    throw e
  }
}

function removeOldFiles() {
  return new Promise((resolve, reject) => {
    rm(path.join(config.build.assetsRoot), err => {
      if (err) throw err
      resolve()
    })
  })
}

function runWebpack() {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig, (err, stats) => {
      if (err) throw err

      process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
      }) + '\n\n')

      process.stdout.write(chalk.cyan('Build complete.\n\n'))
      process.stdout.write(chalk.yellow(
        '  Tip: built files are meant to be served over an HTTP server.\n' +
        '  Opening index.html over file:// won\'t work.\n\n'
      ))
      resolve()
    })
  })
}
