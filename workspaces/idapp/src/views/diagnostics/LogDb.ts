class LogDb {
  static logdb: Array<string> = []

  static log = (event: string) => {
    const timestamp = new Date().toISOString()

    const logItem = `${timestamp}: ${event}`

    this.logdb.unshift(logItem)

    console.log(logItem)

    if (this.logdb.length > 100) {
      this.logdb = this.logdb.slice(this.logdb.length - 100)
    }
  }

  static clear = () => {
    this.logdb = []
  }

  static lastN = (n: number) => {
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
