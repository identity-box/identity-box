class MessageDispatcher {
  messageHandlers = []
  errorHandlers = []

  addSubscription = (onMessage, onError) => {
    this.messageHandlers.push(onMessage)
    if (onError) {
      this.errorHandlers.push(onError)
    } else {
      this.errorHandlers.push(null)
    }
    return this.messageHandlers.length - 1
  }

  removeSubscription = subscription => {
    this.messageHandlers.splice(subscription, 1)
    this.errorHandlers.splice(subscription, 1)
  }

  onMessage = message => {
    this.messageHandlers.forEach(handler => handler(message))
  }

  onError = error => {
    this.errorHandlers.forEach(handler => {
      if (handler) {
        handler(error)
      }
    })
  }
}

export { MessageDispatcher }
