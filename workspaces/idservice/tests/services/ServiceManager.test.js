import { ServiceRegistry } from '../../src/services/ServiceRegistry'
import { ServiceManager } from '../../src/services/ServiceManager'
import { IPCTestServer } from '../utils/IPCTestServer'

import fs from 'fs-extra'
import path from 'path'

describe('ServiceManager', () => {
  const rpcObject1 = {
    service: 'service-manager.service-1',
    method: 'serviceMethod-1',
    params: [
      { message: 'message-1' }
    ]
  }

  const rpcObject2 = {
    service: 'service-manager.service-2',
    method: 'serviceMethod-2',
    params: [
      { message: 'message-2' }
    ]
  }

  const serializerFileDir = path.resolve(process.cwd(), '.fixtures', 'idservice')
  const serializerFilePath = path.resolve(serializerFileDir, 'ServiceManager-Services.json')

  let server1
  let server2
  let serviceRegistry
  let serviceManager

  const prepareFixtureFile = () => {
    fs.ensureDirSync(serializerFileDir)
    fs.removeSync(serializerFilePath)
  }

  beforeEach(async () => {
    server1 = await IPCTestServer.create(rpcObject1.service)
    // console.log('server2=', server2)
    // server2 = undefined
    prepareFixtureFile()
    serviceRegistry = new ServiceRegistry({
      serializerFilePath
    })
    serviceRegistry.register(rpcObject1.service)
    serviceManager = new ServiceManager()
  })

  afterEach(async () => {
    await server1.isClientDisconnected()
    if (server2) {
      await server2.isClientDisconnected()
    }
    fs.removeSync(serializerFilePath)
  })

  it('provides Service proxy corresponding to the given service path', async () => {
    const expectedResponse = server1.queueExpectedResponse({
      method: `${rpcObject1.method}-response`,
      params: [
        { message: `${rpcObject1.params[0].message} response` }
      ]
    })
    const service = serviceManager.get(rpcObject1.service)

    const response = await service.send(rpcObject1)

    expect(response.status).toBe('SUCCESS')
    expect(response.data).toEqual(expectedResponse)
  })

  it('provides a distinct Service proxy for distinct service paths', async () => {
    server2 = await IPCTestServer.create(rpcObject2.service)
    const expectedResponse1 = server1.queueExpectedResponse({
      method: `${rpcObject1.method}-response`,
      params: [
        { message: `${rpcObject1.params[0].message} response` }
      ]
    })
    const expectedResponse2 = server2.queueExpectedResponse({
      method: `${rpcObject2.method}-response`,
      params: [
        { message: `${rpcObject2.params[0].message} response` }
      ]
    })

    const service1 = serviceManager.get(rpcObject1.service)
    const service2 = serviceManager.get(rpcObject2.service)

    expect(service1).not.toBe(service2)

    const response1 = await service1.send(rpcObject1)
    const response2 = await service2.send(rpcObject2)

    expect(response1.status).toBe('SUCCESS')
    expect(response1.data).toEqual(expectedResponse1)

    expect(response2.status).toBe('SUCCESS')
    expect(response2.data).toEqual(expectedResponse2)
  })

  it('provides a new instance of the service proxy on each request', async () => {
    const expectedResponse1 = server1.queueExpectedResponse({
      method: `${rpcObject1.method}-response-1`,
      params: [
        { message: `${rpcObject1.params[0].message}-response-1` }
      ]
    })
    const expectedResponse2 = server1.queueExpectedResponse({
      method: `${rpcObject1.method}-response-2`,
      params: [
        { message: `${rpcObject1.params[0].message}-response-2` }
      ]
    })

    const service1 = serviceManager.get(rpcObject1.service)
    const service2 = serviceManager.get(rpcObject1.service)

    expect(service1).not.toBe(service2)

    const response1 = await service1.send(rpcObject1)
    const response2 = await service2.send(rpcObject1)

    expect(response1.status).toBe('SUCCESS')
    expect(response1.data).toEqual(expectedResponse1)

    expect(response2.status).toBe('SUCCESS')
    expect(response2.data).toEqual(expectedResponse2)
  })
})
