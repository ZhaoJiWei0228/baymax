// see http://vuejs-templates.github.io/webpack for documentation.
var fs = require('fs')
var path = require('path')
var chalk = require('chalk')
var customConfig = path.resolve(process.cwd(), 'custom.config.js')
var customConf = {}
var localConf = {}

// import custom.config.js
if (fs.existsSync(customConfig)) {
  customConf = require(customConfig)
} else {
  console.log(chalk.yellow('Warning: custom.config.js not found!'))
  process.exit(1)
}


// 加载custom.config.js中的环境变量
if (typeof customConf.env === 'object') {
  Object.keys(customConf.env).forEach(d => {
    process.env[d] = customConf.env[d]
  })
}

module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(process.cwd(), 'dist/index.html'),
    assetsRoot: path.resolve(process.cwd(), 'dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: customConf.publicPath || '/',
    productionSourceMap: true,
    // Gzip off by default as many popular static hosts such as
    // Surge or Netlify already gzip all static assets for you.
    // Before setting to `true`, make sure to:
    // npm install --save-dev compression-webpack-plugin
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    // Run the build command with an extra argument to
    // View the bundle analyzer report after build finishes:
    // `npm run build --report`
    // Set to `true` or `false` to always turn it on or off
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./dev.env'),
    port: customConf.port || 8080,
    autoOpenBrowser: !!customConf.openBrowser,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    // CSS Sourcemaps off by default because relative paths are "buggy"
    // with this option, according to the CSS-Loader README
    // (https://github.com/webpack/css-loader#sourcemaps)
    // In our experience, they generally work as expected,
    // just be aware of this issue when enabling this option.
    cssSourceMap: false
  },
  dll: (function() {
    if (!customConf.dll || !customConf.dll.enable) {
      return {
        enable: false
      }
    } else {
      return {
        enable: true,
        entry: (function() {
          return customConf.dll.entry instanceof Array ? {
            dll: customConf.dll.entry
          } : customConf.dll.entry
        })(),
        outputPath: path.resolve('static/.dll')
      }
    }
  })(),
  entry: customConf.entry || './src/main',
  routePrefix: (customConf.router.routePrefix || '').replace(/\/$/, ''),
  routeIgnore: customConf.router.ignore,
  lazyLoad: customConf.router.lazyLoad,
  css: customConf.css || [],
  favicon: customConf.favicon || '',
  externals: customConf.externals || [],
  custom: customConf
}
