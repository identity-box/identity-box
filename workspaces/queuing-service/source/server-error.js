class ServerError extends Error {
  constructor (message) {
    super(message)
    this.name = 'ServerError'
    this.message = message
  }

  toJSON () {
    return {
      error: {
        name: this.name,
        message: this.message
        // stacktrace: this.stack
      }
    }
  }
}

export { ServerError }
