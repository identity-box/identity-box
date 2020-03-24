import { ServiceRegistry } from '../../src/services/ServiceRegistry'
import { ServiceManager } from '../../src/services/ServiceManager'

import fs from 'fs-extra'
import path from 'path'

describe('ServiceManager', () => {
  const servicePath1 = 'service-manager.service-1'
  // const servicePath2 = 'service-manager.service-2'

  const serializerFileDir = path.resolve(process.cwd(), '.fixtures', 'idservice')
  const serializerFilePath = path.resolve(serializerFileDir, 'ServiceManager-Services.json')

  let serviceRegistry
  let serviceManager

  const prepareFixtureFile = () => {
    fs.ensureDirSync(serializerFileDir)
    fs.removeSync(serializerFilePath)
  }

  beforeEach(() => {
    prepareFixtureFile()
    serviceRegistry = new ServiceRegistry({
      serializerFilePath
    })
  })

  afterEach(() => {
    fs.removeSync(serializerFilePath)
  })

  it('starts services from ServiceRegistry on initalization', () => {
    serviceRegistry = new ServiceRegistry({
      serializerFilePath
    })

    const rpcObject = {
      service: servicePath1,
      method: 'serviceMethod',
      params: ['param1']
    }

    serviceRegistry.register(rpcObject.service)

    serviceManager = new ServiceManager()
    const service = serviceManager.get(rpcObject.service)
    const response = service.send(rpcObject)

    expect(response.status).toBe('SUCCESS')
    expect(response.data).toEqual({
      responseMessage: 'hello world'
    })
  })
})
