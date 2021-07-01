#!/usr/bin/env node

var program = require('commander')

program
  .version(require('../package').version)
  .description('Cli for Front-End develop, based on Vue')
  .usage('<command>')

program
  .command('start')
  .description('Start a development server')
  .action(function(){
    require('./dev-server')
  })

program
  .command('dll')
  .description('Build DLL dependencies')
  .action(function(){
    require('./dll')
  })

program
  .command('build')
  .description('Build code for production environments')
  .action(function(){
    require('./build')
  })

program
  .command('deploy')
  .description('Publish code to the remote server')
  .action(function(){
    require('./deploy')
  })

program.parse(process.argv);

function help() {
  program.args.length < 1 && program.help()
}

help()
