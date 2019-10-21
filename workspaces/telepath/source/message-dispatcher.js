class MessageDispatcher {
  subscriptions = []

  addSubscription = (onMessage, onError) => {
    const firstFreePosition = this.subscriptions.indexOf('free')
    const newSubscription = { onMessage, onError: onError || (() => {}) }
    if (firstFreePosition === -1) {
      this.subscriptions = [
        ...this.subscriptions,
        newSubscription
      ]
      return this.subscriptions.length - 1
    } else {
      this.subscriptions[firstFreePosition] = newSubscription
      return firstFreePosition
    }
  }

  removeSubscription = subscriptionId => {
    this.subscriptions[subscriptionId] = 'free'
  }

  onMessage = message => {
    this.subscriptions.filter(s => s !== 'free').forEach(s => {
      s.onMessage(message)
    })
  }

  onError = error => {
    this.subscriptions.filter(s => s !== 'free').forEach(s => {
      s.onError(error)
    })
  }
}

export { MessageDispatcher }
