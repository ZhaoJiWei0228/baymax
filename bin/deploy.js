var fs = require('fs')
var existsSync = fs.existsSync
var chalk = require('chalk')
var ora = require('ora')
var client = require('scp2')
var { resolve, log, success, warnig } = require('../utils')
var configFile = resolve('./deploy.config.js')

function printInfo(info) {
    log('deploy', 'file: ' + chalk.dim(info.file))
    log('deploy', 'remote: ' + chalk.dim(info.host))
    log('deploy', 'path: ' + chalk.dim(info.path))
}

function deploy() {
    if (existsSync(configFile)) {
        var options = require(configFile)
        var { file, ...rest } = options

        if (!file) {
            return warnig('deploy', 'file option not found!')
        }
        printInfo(options)
        var spinner = ora('deploying...').start()

        client.scp(file, rest, function (err) {
            spinner.stop()
            console.log()
            if (err) console.log(err)
            else success('deploy', 'File transferred.')
        });
    } else {
        warnig('deploy', 'file option not found!')
    }
}

deploy()
