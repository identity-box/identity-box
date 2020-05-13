import path from 'path'
import { Telepath } from '../telepath'
import { ServiceRegistrationService, ServiceBroker } from '../services'

class EntryPoint {
  queuingServiceUrl
  telepathLinkBaseUrl
  serviceBroker
  telepath
  subscription

  constructor ({ queuingServiceUrl, telepathLinkBaseUrl }) {
    this.queuingServiceUrl = queuingServiceUrl
    this.telepathLinkBaseUrl = telepathLinkBaseUrl
  }

  startServices = async () => {
    await ServiceRegistrationService.start()
    this.serviceBroker = ServiceBroker.getInstance()
  }

  startTelepath = async () => {
    this.telepath = await this.getTelepath()
    await this.telepath.connect()
    this.subscription = this.telepath.subscribe(
      message => this.processMessage(message),
      error => {
        console.log('error: ' + error)
      }
    )
  }

  start = async () => {
    await this.startServices()
    await this.startTelepath()
  }

  stop = () => {
    console.log('\nUnsubscribing from telepath and exiting...')

    this.telepath.unsubscribe(this.subscription)
  }

  getTelepath = async () => {
    const telepath = new Telepath({
      path: path.resolve(process.cwd(), 'telepath.config'),
      queuingServiceUrl: this.queuingServiceUrl,
      baseUrl: this.telepathLinkBaseUrl
    })
    telepath.describe()
    await telepath.printQRCodeOnTerminal()
    return telepath
  }

  respond = async (method, to, params) => {
    try {
      const response = {
        jsonrpc: '2.0',
        method,
        params: params || []
      }
      await this.telepath.emit(response, {
        to
      })
    } catch (e) {
      console.error(e.message)
    }
  }

  respondWithError = async (method, error, to) => {
    try {
      const response = {
        jsonrpc: '2.0',
        method: `${method || 'unknown'}-error`,
        params: [
          { error: error.message }
        ]
      }
      await this.telepath.emit(response, {
        to
      })
    } catch (e) {
      console.error(e.message)
    }
  }

  processMessage = async message => {
    console.log('MESSAGE:', message)
    try {
      const response = await this.serviceBroker.dispatch(message)
      this.respond(response.method, message.from, response.params)
    } catch (e) {
      console.error(e.message)
      this.respondWithError(message.method, e, message.from)
    }
  }
}

export { EntryPoint }
