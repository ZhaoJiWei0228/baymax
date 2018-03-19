var utils = require('../utils')
var config = require('../config')
var isProduction = process.env.NODE_ENV === 'production'

var loaders = Object.assign(utils.cssLoaders({
  sourceMap: isProduction
    ? config.build.productionSourceMap
    : config.dev.cssSourceMap,
  extract: isProduction
}))

if (config.typescript) {
  loaders = Object.assign(loaders, {
    ts: "ts-loader",
    tsx: "babel-loader!ts-loader"
  })
}

module.exports = {
  loaders: loaders,
  transformToRequire: {
    video: 'src',
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
