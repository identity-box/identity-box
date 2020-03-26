import path from 'path'
import { StateSerializer } from '@identity-box/utils'

class ServiceRegistry {
  services = []
  stateSerializer

  constructor ({ serializerFilePath } = {}) {
    const filePath = serializerFilePath || path.resolve(process.cwd(), 'Services.json')
    this.stateSerializer = new StateSerializer(filePath)
    this.services = this.stateSerializer.read() || []
  }

  checkPath = path => {
    if (!path) {
      throw new Error('Attemting to register a service without providing path!')
    }

    const [serviceNamespace, serviceName, ...rest] = path.split('.')

    if (rest.length > 0) {
      throw new Error('Too many service path components!')
    }

    if (serviceNamespace === undefined || serviceNamespace.length === 0) {
      throw new Error('Missing service namespace in path!')
    }

    if (serviceName === undefined || serviceName.length === 0) {
      throw new Error('Missing service name in path!')
    }
  }

  isRegistred = servicePath => {
    return this.services.includes(servicePath)
  }

  register = servicePath => {
    this.checkPath(servicePath)
    if (this.isRegistred(servicePath)) {
      throw new Error('Service with given path already exists!')
    }
    this.services.push(servicePath)
    this.stateSerializer.write(this.services)
  }
}

export { ServiceRegistry }
