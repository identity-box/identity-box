import { ServiceRegistry } from '../../src/services/ServiceRegistry'
import { ServiceManager } from '../../src/services/ServiceManager'
import { IPCTestServer } from '@identity-box/utils'

import nacl from 'tweetnacl'
import base64url from 'base64url'
import fs from 'fs-extra'
import path from 'path'

describe('ServiceManager', () => {
  const rpcObject1 = {
    method: 'serviceMethod-1',
    params: [
      { message: 'message-1' }
    ]
  }

  const rpcObject2 = {
    method: 'serviceMethod-2',
    params: [
      { message: 'message-2' }
    ]
  }

  const serializerFileDir = path.resolve(process.cwd(), '.fixtures', 'idservice')
  const serializerFilePath = path.resolve(serializerFileDir, 'ServiceManager-Services.json')

  let servicePath1
  let servicePath2
  let server1
  let server2
  let serviceRegistry
  let serviceManager

  const prepareServicePaths = () => {
    let serviceId = base64url.encode(nacl.hash(nacl.randomBytes(10)))
    servicePath1 = `service-registration-service.${serviceId}`
    serviceId = base64url.encode(nacl.hash(nacl.randomBytes(10)))
    servicePath2 = `service-registration-service.${serviceId}`
  }

  const prepareFixtureFile = () => {
    fs.ensureDirSync(serializerFileDir)
    fs.removeSync(serializerFilePath)
  }

  beforeEach(async () => {
    prepareServicePaths()
    prepareFixtureFile()
    server1 = await IPCTestServer.create(servicePath1)
    serviceRegistry = new ServiceRegistry({
      serializerFilePath
    })
    serviceRegistry.register(servicePath1)
    serviceRegistry.register(servicePath2)
    serviceManager = new ServiceManager({ serviceRegistry })
  })

  afterEach(async () => {
    await server1.isClientDisconnected()
    if (server2) {
      await server2.isClientDisconnected()
    }
    fs.removeSync(serializerFilePath)
  })

  it('throws if service was not previously registered', () => {
    const nonExistentPath = 'some-service.path'
    const expectedError = new Error(`Service ${nonExistentPath} is not registered!`)
    expect(() => serviceManager.get(nonExistentPath)).toThrow(expectedError)
  })

  it('provides Service proxy corresponding to the given service path', async () => {
    const expectedResponse = server1.queueExpectedResponse({
      method: `${rpcObject1.method}-response`,
      params: [
        { message: `${rpcObject1.params[0].message} response` }
      ]
    })
    const service = serviceManager.get(servicePath1)

    const response = await service.send(rpcObject1)

    expect(response.response).toEqual(expectedResponse)
  })

  it('provides a distinct Service proxy for distinct service paths', async () => {
    server2 = await IPCTestServer.create(servicePath2)
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

    const service1 = serviceManager.get(servicePath1)
    const service2 = serviceManager.get(servicePath2)

    expect(service1).not.toBe(service2)

    const response1 = await service1.send(rpcObject1)
    const response2 = await service2.send(rpcObject2)

    expect(response1.response).toEqual(expectedResponse1)
    expect(response2.response).toEqual(expectedResponse2)
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

    const service1 = serviceManager.get(servicePath1)
    const service2 = serviceManager.get(servicePath1)

    expect(service1).not.toBe(service2)

    const response1 = await service1.send(rpcObject1)
    const response2 = await service2.send(rpcObject1)

    expect(response1.response).toEqual(expectedResponse1)
    expect(response2.response).toEqual(expectedResponse2)
  })
})
