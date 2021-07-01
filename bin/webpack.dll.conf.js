var config = require('../config')
var webpack = require('webpack')
var path = require('path')

module.exports = {
  mode: 'production',
  output: {
    path: config.dll.outputPath,
    filename: '[name].js',
    library: '[name]'
  },
  entry: config.dll.entry,
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(config.dll.outputPath, '[name].manifest.json'),
      name: '[name]'
    })
  ]
}
