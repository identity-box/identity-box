const execSync = require('child_process').execSync

class Builder {
  constructor ({ moduleName, copyFiles }) {
    this.moduleName = moduleName
    this.copyFiles = copyFiles ? '--copy-files' : ''
  }

  exec (command, extraEnv) {
    execSync(command, {
      stdio: 'inherit',
      env: Object.assign({}, process.env, extraEnv)
    })
  }

  build () {
    console.log('\n---------------------------------------------------')
    console.log(`Building ${this.moduleName}`)
    console.log('Building CommonJS modules ...')

    this.exec(`babel source -d lib --delete-dir-on-start --no-babelrc ${this.copyFiles}`, {
      BABEL_ENV: 'commonjs'
    })

    console.log('\nBuilding ES modules ...')

    this.exec(`babel source -d es --delete-dir-on-start --no-babelrc ${this.copyFiles}`, {
      BABEL_ENV: 'es'
    })

    console.log('---------------------------------------------------\n')
  }
}

module.exports = { Builder }
