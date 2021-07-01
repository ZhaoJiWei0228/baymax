var assert = require('assert')
var fs = require('fs')
var chokidar = require('chokidar')
var chalk = require('chalk')
var Mock = require('mockjs')
var _ = require('lodash')
var bodyParser = require('body-parser')
var proxyMiddleware = require('http-proxy-middleware')

var existsSync = fs.existsSync

var error = null
var { resolve, log, fail, done } = require('../utils')
var configFile = resolve('./mock.config.js')
var mockDir = resolve('./mock/')
var appDirectory = resolve()

var debug = require('debug')('baymax:mock')

function getConfig() {
	if (existsSync(configFile)) {
		// disable require cache
		Object.keys(require.cache).forEach(file => {
		if (file === configFile || file.indexOf(mockDir) > -1) {
			debug(`delete cache ${file}`)
			delete require.cache[file]
		}
		})
		return require(configFile)
	} else {
		return {}
	}
}

function parseKey(key) {
	var method = 'get'
	var path = key

	if (key.indexOf(' ') > -1) {
	  var splited = key.split(' ')
	  method = splited[0].toLowerCase()
	  path = splited[1]
	}

	return { method, path }
}

function createMockHandler(method, path, value) {
	return function mockHandler(...args) {
	  const res = args[1]
	  if (typeof value === 'function') {
			value(...args)
	  } else {
			res.json(Mock.mock(value))
	  }
	}
}

function createProxy(path, target) {
	var options = {
		logLevel: 'silent'
	}
	if (typeof target === 'string') {
		options.target = target
	} else {
		options = Object.assign(options, target)
	}	

  return proxyMiddleware(path, options)
}

function createGlobalProxy(proxy, app) {
	var path = proxy.path || '/api'
	var options = proxy.options || {}
	app.use(path, createProxy(path, options))
}

function outputError() {
	if (!error) return

	var filePath = error.message.split(': ')[0]
	var relativeFilePath = filePath.replace(appDirectory, '.')
	var errors = error.stack
	  .split('\n')
	  .filter(line => line.trim().indexOf('at ') !== 0)
	  .map(line => line.replace(`${filePath}: `, ''))
	errors.splice(1, 0, [''])

	fail('mock', 'Failed to parse mock config.')
	console.log()
	fail('mock', `Error in ${relativeFilePath}`)
	fail(errors.join('\n'))
	console.log()
}

function realApplyMock(app) {
	var config = getConfig()
	var proxy = config.proxy || {}
	var mock = config.mock || {}

	if (proxy.enable) {
		// Global proxy
		createGlobalProxy(proxy, app)
	} else if (_.isArray(proxy)) {
		// feat: supoort array
		proxy.forEach(item => {
			if (item.enable) {
				createGlobalProxy(item, app)
			}
		})
	} else {
		Object.keys(mock).forEach(key => {
			var keyParsed = parseKey(key)
			assert(
				typeof mock[key] === 'function' ||
					typeof mock[key] === 'object' ||
					typeof mock[key] === 'string',
				`mock value of ${key} should be function or object or string, but got ${typeof mock[
					key
				]}`,
			)
			if (typeof mock[key] === 'string') {
				var { path } = keyParsed
				// proxy data
				app.use(path, createProxy(path, mock[key]))
			} else {
				if (typeof mock[key] === 'object' && mock[key].target != null) {
					var { path } = keyParsed
					// proxy data
					app.use(path, createProxy(path, mock[key]))
				} else {
					// mock data
					app[keyParsed.method](
						keyParsed.path,
						createMockHandler(keyParsed.method, keyParsed.path, mock[key]),
					)
				}
			}
		})
	}

	app.use(bodyParser.json({ limit: '5mb' }))
	app.use(
	  bodyParser.urlencoded({
		extended: true,
		limit: '5mb',
	  }),
	)

  var startIndex = null
  var lastIndex = null
	var mockAPILength = null
	
	app._router.stack.forEach((item, index) => {
    if (item.name === 'expressInit') {
      startIndex = index + 1
    }
	  if (item.name === 'serveStatic') {
		  lastIndex = index
    }
	})

  // update middleware
	if (lastIndex) {
    mockAPILength = app._router.stack.length - lastIndex - 1
		var newStack = app._router.stack.splice(lastIndex + 1, mockAPILength)
		app._router.stack.splice(startIndex, 0, ...newStack)
	} else {
    mockAPILength = app._router.stack.length - startIndex
	}

	var watcher = chokidar.watch([configFile, mockDir], {
	  ignored: /node_modules/,
	  persistent: true,
	})
	watcher.on('change', path => {
		log('mock', chalk.green('CHANGED') + path.replace(appDirectory, '.') + '\n')
	  watcher.close()
		// remove previous configuration
		app._router.stack.splice(startIndex, mockAPILength)
	  applyMock(app)
	})
	done('mock', 'init mock')
}

function applyMock(app) {
	try {
		realApplyMock(app)
		error = null
	} catch (e) {
		error = e
		outputError()

		const watcher = chokidar.watch([configFile, mockDir], {
			ignored: /node_modules/,
			ignoreInitial: true,
		})
		watcher.on('change', path => {
			log('mock', 
				chalk.green('CHANGED') + path.replace(appDirectory, '.'),
			)
			watcher.close()
			applyMock(app)
		})
	}
}

module.exports = applyMock
