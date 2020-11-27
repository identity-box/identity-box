class LogDb {
  static logdb = []

  static log = event => {
    const timestamp = (new Date()).toLocaleString()

    this.logdb.push(`${timestamp}: ${event}`)

    if (this.logdb.length > 100) {
      this.logdb = this.logdb.slice(this.logdb.length - 100)
    }
  }

  static clear = () => {
    this.logdb = []
  }

  static lastN = n => {
    if (n === 0) {
      return []
    }
    if (n > this.logdb.length) {
      return this.logdb
    }
    return this.logdb.slice(this.logdb.length - n)
  }
}

export { LogDb }
