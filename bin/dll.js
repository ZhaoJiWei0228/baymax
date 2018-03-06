require('./check-versions')()
var webpack = require('webpack')
var chalk = require('chalk')
var config = require('../config')

if (!config.dll.enable) {
  console.log(chalk.yellow('如果要执行dll，请在custom.config.js的dll配置中设置enable:true,并设置相应的entry\n'))
  process.exit(0)
}
console.log(chalk.cyan('building dll...\n'))

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
  console.log(chalk.cyan('build dll complete.\n'))
})
