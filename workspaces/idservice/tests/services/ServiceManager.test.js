import { ServiceRegistry } from '../../src/services/ServiceRegistry'
import { ServiceManager } from '../../src/services/ServiceManager'
import { IPCTestServer } from '../utils/IPCTestServer'

import fs from 'fs-extra'
import path from 'path'

describe('ServiceManager', () => {
  const servicePath1 = 'service-manager.service-1'

  const serializerFileDir = path.resolve(process.cwd(), '.fixtures', 'idservice')
  const serializerFilePath = path.resolve(serializerFileDir, 'ServiceManager-Services.json')

  let serviceRegistry
  let serviceManager
  let isClientDisconnected

  const prepareFixtureFile = () => {
    fs.ensureDirSync(serializerFileDir)
    fs.removeSync(serializerFilePath)
  }

  beforeEach(async () => {
    ({ isClientDisconnected } = await IPCTestServer.create(servicePath1))
    prepareFixtureFile()
    serviceRegistry = new ServiceRegistry({
      serializerFilePath
    })
  })

  afterEach(() => {
    fs.removeSync(serializerFilePath)
  })

  it('starts services from ServiceRegistry on initalization', async () => {
    serviceRegistry = new ServiceRegistry({
      serializerFilePath
    })

    const rpcObject = {
      service: servicePath1,
      method: 'serviceMethod',
      params: [
        { message: 'message' }
      ]
    }

    serviceRegistry.register(rpcObject.service)

    serviceManager = new ServiceManager()
    const service = serviceManager.get(rpcObject.service)
    const response = await service.send(rpcObject)

    await isClientDisconnected()

    expect(response.status).toBe('SUCCESS')
    expect(response.data).toEqual({
      method: `${rpcObject.method}-response`,
      params: [
        { message: `${rpcObject.params[0].message} response` }
      ]
    })
  })
})
