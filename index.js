#!/usr/bin/env node

const colorc = require('@kenworks/colorconsole')
const semver = require('semver')
const requiredVersion = require('./package.json').engines.node

function checkNodeVersion (wanted, id) {
  if (!semver.satisfies(process.version, wanted)) {
    colorc.log(
      'You are using Node ' + process.version + ', but this version of ' + id +
      ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
    , 'red')
    process.exit(1)
  }
}

checkNodeVersion(requiredVersion, 'nginxhost')

if (semver.satisfies(process.version, '9.x')) {
    colorc.log(
    `You are using Node ${process.version}.\n` +
    `Node.js 9.x has already reached end-of-life and will not be supported in future major releases.\n` +
    `It's strongly recommended to use an active LTS version instead.`
    , 'red')
}

const program = require('commander')

program.version(`nginxhost ${require('./package').version}`)
    .option('-d, --debug', 'output extra debugging')

program.parse(process.argv)

if (!process.argv.slice(2).length) {
    // program.outputHelp(text => colorc.text(text, 'green'))
}

if (program.debug) console.log(program.opts())

const path = require('path')
const fs = require('fs-extra')
const ejs = require('ejs')

let nginxhostConfig = null

if (fs.existsSync('./nginxhost.json')) {
    nginxhostConfig = fs.readJsonSync('./nginxhost.json', 'utf8')
} else if (fs.existsSync('./package.json')) {
    const projpkg = fs.readJsonSync('./package.json', 'utf8')
    if (!('nginxhost' in projpkg)) {
        colorc.log('init nginxhost in ./package.json', 'green')
        let newNginxhostConfig = {
            "listen": 80,
            "ssl": false,
            "sslConfig": {
                "pem": `${projpkg.name}`,
                "key": `${projpkg.name}`
            },
            "server_name": `www.${projpkg.name}.com ${projpkg.name}.com`,
            "root": `/var/www/${projpkg.name}`,
            "index": "index.html index.htm",
            "locations": [],
            "staticCached": false,
            "php": false
        }
        projpkg['nginxhost'] = newNginxhostConfig
        fs.writeFileSync('./package.json', JSON.stringify(projpkg, null, 4), 'utf-8')
    }

    nginxhostConfig = projpkg['nginxhost']
} else {
    colorc.log('init nginxhost in ./nginxhost.json', 'green')
    nginxhostConfig = {
        "listen": 80,
        "ssl": false,
        "sslConfig": {
            "pem": 'myapp',
            "key": 'myapp'
        },
        "server_name": 'www.myapp.com myapp.com',
        "root": `/var/www/myapp`,
        "index": "index.html index.htm",
        "locations": [],
        "staticCached": false,
        "php": false
    }
    fs.writeFileSync('./nginxhost.json', JSON.stringify(nginxhostConfig, null, 4), 'utf-8')
}

// const templatePath = path.resolve(process.cwd(), 'node_modules/nginxhost/host.ejs')
// runtime path
let templatePath = path.resolve(path.dirname(require.resolve('@kenworks/colorconsole')), '../../../host.ejs')

if (!nginxhostConfig['staticCached'] && !nginxhostConfig['php']) {
    templatePath = path.resolve(path.dirname(require.resolve('@kenworks/colorconsole')), '../../../host_def.ejs')
}

if ('php' in nginxhostConfig && nginxhostConfig['php']) {
    nginxhostConfig['index'] = `index.php Index.php ${nginxhostConfig['index']}`
}

if (fs.existsSync(templatePath)) {
    // fs.readFileSync(templatePath, 'utf-8')
    ejs.renderFile(templatePath, nginxhostConfig, {}, function(err, str){
        console.log(str)
        fs.writeFileSync('./vhost', str, 'utf-8')
    })
} else {
    colorc.log(`file "${templatePath}" not found`, 'red')
}
