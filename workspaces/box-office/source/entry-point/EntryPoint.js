import { BoxOfficeService, ServiceRegistry } from '../services/index.js'

class EntryPoint {
  servicePath
  boxOfficeService

  constructor ({ servicePath }) {
    this.servicePath = servicePath
  }

  start = async () => {
    this.boxOfficeService = await BoxOfficeService.create({
      servicePath: this.servicePath,
      serviceRegistry: ServiceRegistry.getInstance()
    })
  }

  stop = () => {
    this.boxOfficeService && this.boxOfficeService.stop()
  }
}

export { EntryPoint }
