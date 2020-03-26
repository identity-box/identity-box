import { Service } from './Service'

class ServiceManager {
  get = servicePath => {
    return new Service(servicePath)
  }
}

export { ServiceManager }
