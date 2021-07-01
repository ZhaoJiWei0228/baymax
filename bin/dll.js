require('./check-versions')()
var webpack = require('webpack')
var chalk = require('chalk')
var config = require('../config')

if (!config.dll.enable) {
  console.log(chalk.yellow('Enalbed the dll config'))
  process.exit(0)
}

console.log(chalk.cyan('Building dll...\n'))

var dllConf = require('./webpack.dll.conf')
var compiler = webpack(dllConf)

compiler.run(function (err, stats) {
  if (err) throw err
  process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n')
  console.log(chalk.cyan('Build dll complete.\n'))
})
