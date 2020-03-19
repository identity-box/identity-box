import fs from 'fs'

class StateSerializer {
  path

  constructor (path) {
    this.path = path
  }

  write = stateJson => {
    const stateStr = JSON.stringify(stateJson)
    fs.writeFileSync(this.path, stateStr)
  }

  read = () => {
    if (!fs.existsSync(this.path)) {
      return undefined
    }
    try {
      const stateStr = fs.readFileSync(this.path, 'UTF-8')
      return JSON.parse(stateStr)
    } catch (e) {
      console.error(e)
      return undefined
    }
  }
}

export { StateSerializer }
