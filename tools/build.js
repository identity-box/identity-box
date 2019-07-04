const path = require('path')
const execSync = require('child_process').execSync
const packageJson = require(path.join(process.cwd(), 'package.json'))

class Builder {
  constructor ({ copyFiles } = {}) {
    this.packageName = packageJson.name
    this.esModule = packageJson.module
    this.copyFiles = copyFiles ? '--copy-files' : ''
  }

  exec (command, extraEnv) {
    execSync(command, {
      stdio: 'inherit',
      env: Object.assign({}, process.env, extraEnv)
    })
  }

  transpile ({ logMessage, babelEnv, outputDir }) {
    console.log(logMessage)

    this.exec(`babel source -d ${outputDir} --delete-dir-on-start ${this.copyFiles} --source-maps`, {
      BABEL_ENV: babelEnv
    })
  }

  commonjs () {
    this.transpile({
      logMessage: '\nBuilding CommonJS modules...',
      babelEnv: 'commonjs',
      outputDir: 'lib'
    })
  }

  es () {
    if (this.esModule) {
      this.transpile({
        logMessage: '\nBuilding ES modules...',
        babelEnv: 'es',
        outputDir: 'es'
      })
    }
  }

  build () {
    console.log('\n---------------------------------------------------')
    console.log(`Building ${this.packageName}`)
    this.commonjs()
    this.es()
    console.log('---------------------------------------------------\n')
  }
}

module.exports = { Builder }
