#!/usr/bin/env node

var chalk = require('chalk')
var cmd = process.argv[ 2 ] || 'start'
var presetCmds = {
  'start': 'dev-server',
  'build': 'build',
  'dll': 'dll'
}

if (!(cmd in presetCmds)) {
  console.log(chalk.red('Unkown command "' + cmd + '"!'))
  console.log()
  console.log(chalk.dim('Available commands:'))
  console.log()
  console.log('    ' + 'start:' + chalk.dim('启动一个开发服务器'))
  console.log()
  console.log('    ' + 'build:' + chalk.dim('编译生产环境用的代码'))
  console.log()
  process.exit(1)
}

require('./' + presetCmds[ cmd ])
