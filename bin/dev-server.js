require('./check-versions')()
var chalk = require('chalk')
var fs = require('fs')
var os = require('os')
var _ = require('lodash')
var config = require('../config')
var applyMock = require('../mock')
var utils = require('../utils')
var generateRouter = require('./generate-router')

if (config.dll.enable && !fs.existsSync('static/.dll')) {
  console.log(chalk.yellow('DLL has been enabled.  please first execute npm run dll and disabled if not required!'))
  process.exit(0)
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var protocol = 'http'
var port = process.env.PORT || config.dev.port
var autoOpenBrowser = !!config.dev.autoOpenBrowser
// enable multi-entry configuration
var multiEntry = config.multiEntry
var isMulti = _.isArray(multiEntry)

// App init
var app = express()

// Mock init
applyMock(app)

// Generate router
generateRouter()

var webpack = require('webpack')
var webpackConfig = require('./webpack.dev.conf')
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  logLevel: 'silent',
  watchOptions: {
    aggregateTimeout: 400 // 增加延迟，避免与generate route冲突
  }
})

var hotMiddleware = require('webpack-hot-middleware')(compiler, {
  log: () => {},
  heartbeat: 2000
})

// 由于html-webpack-plugin的问题（isCompilationCached取值）(https://github.com/jantimon/html-webpack-plugin/blob/e2c6990e94b298ff66bcd885c9a03a78221479f6/index.js#L132)，
// 事件多次调用，影响热替换，故新版本暂且不支持模板更新自动刷新
// force page reload when html-webpack-plugin template changes
// compiler.hooks.compilation.tap('htmlWebpack', function (compilation) {
//   compilation.hooks.htmlWebpackPluginAfterEmit.tap('htmlWebpack', function (data, cb) {
//     hotMiddleware.publish({ action: 'reload' })
//   });
// })

// handle fallback for HTML5 history API
// if multi-entry enabled, stop watching router files
if (multiEntry) {
  if (!isMulti) {
    utils.fail('server', 'MultiEntry value should be array')
  }
  app.use(require('connect-history-api-fallback')({
    rewrites: multiEntry.map(function(entry) {
      return {
        from: new RegExp(`^\/${entry.name}\/.*$`),
        to: `/${entry.name}/index.html`
      }
    })
  }))
} else {
  app.use(require('connect-history-api-fallback')())
}

app.use(devMiddleware)
app.use(hotMiddleware)

var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)

app.use(staticPath, express.static('./static'))
app.use(path.posix.join(config.dev.assetsPublicPath, 'node_modules'), express.static('./node_modules'))

var _resolve
var readyPromise = new Promise(resolve => {
  _resolve = resolve
})

var uri = protocol + '://localhost:' + port
var ifaces = os.networkInterfaces()

function outputPath(url) {
  utils.clearTerminal()
  console.log(chalk.green.bold('Baymax server started'))
  console.log()
  Object.keys(ifaces).forEach(function (dev) {
    ifaces[dev].forEach(function (details) {
      if (details.family === 'IPv4') {
        utils.success('server', url ? protocol + '://' + details.address + ':' + port + '/' + url + '/' : protocol + '://' + details.address + ':' + port)
      }
    });
  });
  console.log('\n')
}

devMiddleware.waitUntilValid(() => {
  if (isMulti) {
    multiEntry.forEach(function(entry) {
      outputPath(entry.name)
    })
  } else {
    outputPath()
  }
  if (autoOpenBrowser) {
    opn(uri)
  }
  _resolve()
})

var server = app.listen(port)

module.exports = {
  ready: readyPromise,
  close: () => {
    server.close()
  }
}
