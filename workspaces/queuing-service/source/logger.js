class Logger {
  static setVerbose (status) {
    Logger.verbose = status
    console.log(`[INFO] setting verbose to ${status}`)
  }

  static separator () {
    if (!Logger.verbose) return

    console.log('--------------------------')
  }

  static logChannelAndClientIds (header, clientSocket, inhibit = false) {
    if (!Logger.verbose) return

    if (!inhibit) {
      console.log(header)
      console.log('channelId', clientSocket.channelId)
      console.log('clientId', clientSocket.clientId)
    }
  }

  static logError (message) {
    if (!Logger.verbose) return

    console.log(`[ERROR] ${message}`)
  }

  static logMessage (message) {
    if (!Logger.verbose) return

    console.log('message: ', message)
  }

  static logInfo (message) {
    if (!Logger.verbose) return

    console.log(`[INFO] ${message}`)
  }
}

export { Logger }
