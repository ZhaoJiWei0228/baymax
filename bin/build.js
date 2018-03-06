require('./check-versions')()

process.env.NODE_ENV = 'production'

var fs = require('fs')
var rm = require('rimraf')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var config = require('../config')
var generateRouter = require('./generate-router')
var webpackConfig = require('./webpack.prod.conf')

const SPINNER = 'building for production... '
const SPINNER_ROUTER = 'generating router... '
const SPINNER_DONE = chalk.green('✔') + '\n'

run()

async function run() {
  try {
    process.stdout.write(SPINNER_ROUTER)
    await generateRouter() // 生成路由
    process.stdout.write(SPINNER_DONE)
    process.stdout.write(SPINNER)
    await removeOldFiles() // 删除上次生成的文件
    await runWebpack() // 构建
  } catch (e) {
    throw e
  }
}

function removeOldFiles() {
  return new Promise((resolve, reject) => {
    rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
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
