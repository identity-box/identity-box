import { IdentityService, Dispatcher } from '../services/index.js'
import { ServiceProxy } from '@identity-box/utils'

class EntryPoint {
  identityService
  servicePath

  constructor ({ servicePath, registrationPath }) {
    this.servicePath = servicePath
    this.registrationPath = registrationPath
  }

  validateRegistrationResponse = response => {
    return (
      response.method === 'register-response' &&
      response.params.length === 1 &&
      response.params[0].servicePath === this.servicePath
    )
  }

  register = () => {
    const registrationRequest = {
      method: 'register',
      params: [
        { servicePath: this.servicePath }
      ]
    }
    const serviceProxy = new ServiceProxy(this.registrationPath)
    return serviceProxy.send(registrationRequest)
  }

  start = async () => {
    const dispatcher = new Dispatcher()
    this.identityService = await IdentityService.create({
      servicePath: this.servicePath,
      dispatcher
    })
    if (this.registrationPath) {
      const { response } = await this.register()

      if (this.validateRegistrationResponse(response)) {
        console.log('registration successful')
      } else {
        console.log('registration failed!')
        console.log('received:')
        console.log(JSON.stringify(response))
      }
    }
  }

  stop = () => {
    this.identityService && this.identityService.stop()
  }
}

export { EntryPoint }
