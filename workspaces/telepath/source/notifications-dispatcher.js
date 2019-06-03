export class NotificationsDispatcher {
  constructor () {
    this.notificationHandlers = []
    this.errorHandlers = []
  }

  addSubscription (onNotification, onError) {
    this.notificationHandlers.push(onNotification)
    if (onError) {
      this.errorHandlers.push(onError)
    } else {
      this.errorHandlers.push(null)
    }
    return this.notificationHandlers.length - 1
  }

  removeSubscription (subscription) {
    this.notificationHandlers.splice(subscription, 1)
    this.errorHandlers.splice(subscription, 1)
  }

  onNotification (notification) {
    this.notificationHandlers.forEach(handler => handler(notification))
  }

  onError (error) {
    this.errorHandlers.forEach(handler => {
      if (handler) {
        handler(error)
      }
    })
  }
}
