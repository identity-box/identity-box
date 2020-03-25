import { Service } from './Service'

class ServiceManager {
  get = servicePath => {
    return new Service()
  }
}

export { ServiceManager }
