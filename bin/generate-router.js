var chokidar = require('chokidar')
var fs = require('fs')
var glob = require('glob')
var _ = require('lodash')
var { relativeTo, resolve, log, done } = require('../utils')
var config = require('../config')
var multiEntry = config.multiEntry
var isMulti = _.isArray(multiEntry)

function cleanChildrenRoutes(routes, isChild = false) {
  var start = -1
  var routesIndex = []
  
  routes.forEach((route) => {
    if (/-index$/.test(route.name) || route.name === 'index') {
      // Save indexOf 'index' key in name
      var res = route.name.split('-')
      var s = res.indexOf('index')
      start = (start === -1 || s < start) ? s : start
      routesIndex.push(res)
    }
  })
  routes.forEach((route) => {
    route.path = (isChild) ? route.path.replace('/', '') : route.path
    if (route.path.indexOf('?') > -1) {
      var names = route.name.split('-')
      var paths = route.path.split('/')
      if (!isChild) {
        paths.shift()
      } // clean first / for parents
      routesIndex.forEach((r) => {
        var i = r.indexOf('index') - start //  children names
        if (i < paths.length) {
          for (var a = 0; a <= i; a++) {
            if (a === i) {
              paths[a] = paths[a].replace('?', '')
            }
            if (a < i && names[a] !== r[a]) {
              break
            }
          }
        }
      })
      route.path = (isChild ? '' : '/') + paths.join('/')
    }
    route.name = route.name.replace(/-index$/, '')
    if (route.children) {
      if (route.children.find((child) => child.path === '')) {
        delete route.name
      }
      route.children = cleanChildrenRoutes(route.children, true)
    }
  })
  return routes
}

/**
 * 生成路由对象
 * @param {*} files
 */
function createRoutes(files) {
  var routes = []
  files.forEach((file) => {
    var keys = file.replace(/^pages/, '').replace(/(\.vue|\.js)$/, '').replace(/\/{2,}/g, '/').split('/').slice(1)
    var route = { name: '', path: '', component: file }
    var parent = routes
    keys.forEach((key, i) => {
      route.name = route.name ? route.name + '-' + key.replace('_', '') : key.replace('_', '')
      route.name += (key === '_') ? 'all' : ''
      var child = _.find(parent, { name: route.name })
      if (child) {
        if (!child.children) {
          child.children = []
        }
        parent = child.children
        route.path = ''
      } else {
        if (key === 'index' && (i + 1) === keys.length) {
          route.path += (i > 0 ? '' : '/')
        } else {
          route.path += '/' + (key === '_' ? '*' : key.replace('_', ':'))
          if (key !== '_' && key.indexOf('_') !== -1) {
            route.path += '?'
          }
        }
      }
    })
    // Order Routes path
    parent.push(route)
    parent.sort((a, b) => {
      if (!a.path.length || a.path === '/') {
        return -1
      }
      if (!b.path.length || b.path === '/') {
        return 1
      }
      var res = 0
      var _a = a.path.split('/')
      var _b = b.path.split('/')
      for (var i = 0; i < _a.length; i++) {
        if (res !== 0) {
          break
        }
        var y = (_a[i].indexOf('*') > -1) ? 2 : (_a[i].indexOf(':') > -1 ? 1 : 0)
        var z = (_b[i].indexOf('*') > -1) ? 2 : (_b[i].indexOf(':') > -1 ? 1 : 0)
        res = y - z
        if (i === _b.length - 1 && res === 0) {
          res = 1
        }
      }
      return res === 0 ? -1 : res
    })
  })
  return cleanChildrenRoutes(routes)
}
/**
 * 递归拼装vue-router路由配置信息
 * @param {*} routes
 * @param {*} components
 */
function recursiveRoutes(routes, components) {
  routes.forEach((route, i) => {
    let componentName = route.name
      ? route.name.replace(/-[a-zA-Z0-9]{1}/g, w => w[1].toUpperCase())
      : '_' + Math.ceil(Math.random() * 100000)
    components.push({ component: relativeTo('src/router', route.component), name: componentName })
    route.path = route.path.replace(/^\/pages/, config.routePrefix)
    route.component = componentName
    !route.name && delete route.name
    if (route.children) {
      recursiveRoutes(routes[i].children, components)
    }
  })
}

function generateRoutesAndFiles() {
  var dir = 'routes'
  var file = 'routes.js'
  var declaration = 'let routes' 
  var disable = '/* eslint-disable */\n'
  var files = []

  if (config.typescript) {
    file = 'routes.ts'
    declaration = 'import { RouteConfig } from \'vue-router\'\nlet routes: RouteConfig[]'
    disable = '/* tslint:disable */\n'
  }

  files = glob.sync('src/pages/**/*.@(vue|js)', { nonull: false, ignore: config.routeIgnore })
  
  if (!files.length) {
    fs.writeFileSync(`./src/${dir}/${file}`, `${declaration} = []\nexport default routes\n`)
  } else {
    let routes = createRoutes(files)
    let components = []
    let fileContent = disable
    let routesStr
    recursiveRoutes(routes, components)
    _.uniqBy(components, 'name').forEach(d => {
      fileContent += config.lazyLoad
        ? `const ${d.name} = resolve => require(['${d.component}'], resolve)\n`
        : `const ${d.name} = resolve => require('${d.component}')\n`
    })
    routesStr = JSON.stringify(routes, null, 2)
      .replace(/"component": "(\w+?)"/g, `"component": $1`)
      .replace(/"(\w+?)":/g, '$1:')
    fileContent += `\n${declaration} = ${routesStr}\n\nexport default routes\n`
    fs.writeFileSync(`./src/${dir}/${file}`, fileContent)
  }

  done('router', 'generate routes')

  // return new Promise((resolve, reject) => {
  //   glob('src/pages/**/*.@(vue|js)', { nonull: false, ignore: config.routeIgnore }, (err, files) => {
  //     if (err) throw err
  //     if (!files.length) {
  //       fs.writeFile(`./src/${dir}/${file}`, `${declaration} = []\nexport default routes\n`, (_err) => {
  //         if (_err) throw _err
  //         resolve()
  //       })
  //     } else {
  //       let routes = createRoutes(files)
  //       let components = []
  //       let fileContent = disable
  //       let routesStr
  //       recursiveRoutes(routes, components)
  //       _.uniqBy(components, 'name').forEach(d => {
  //         fileContent += config.lazyLoad
  //           ? `const ${d.name} = resolve => require(['${d.component}'], resolve)\n`
  //           : `const ${d.name} = resolve => require('${d.component}')\n`
  //       })
  //       routesStr = JSON.stringify(routes, null, 2)
  //         .replace(/"component": "(\w+?)"/g, `"component": $1`)
  //         .replace(/"(\w+?)":/g, '$1:')
  //       fileContent += `\n${declaration} = ${routesStr}\n\nexport default routes\n`
  //       fs.writeFile(`./src/${dir}/${file}`, fileContent, (_err) => {
  //         if (_err) throw _err
  //         resolve()
  //       })
  //     }
  //   })
  // })
}

const refreshFiles = _.debounce(() => {
  generateRoutesAndFiles()
}, 200)

module.exports = function() {
  if(isMulti) return

  const patterns = [
    resolve('src/pages/*.vue'),
    resolve('src/pages/**/*.vue'),
    resolve('src/pages/*.js'),
    resolve('src/pages/**/*.js')
  ]

  if (process.env.NODE_ENV !== 'development') {
    return generateRoutesAndFiles()
  } else {
	  generateRoutesAndFiles()
    chokidar.watch(patterns, { ignored: config.routeIgnore, ignoreInitial: true })
      .on('add', () => { log('router', 'onadd'); refreshFiles() })
      .on('unlink', () => { log('router', 'onunlink'); refreshFiles() })
  }
}
