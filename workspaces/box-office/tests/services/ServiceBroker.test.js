import { ServiceRegistry } from '../../source/services/ServiceRegistry'
import { ServiceManager } from '../../source/services/ServiceManager'
import { ServiceBroker } from '../../source/services/ServiceBroker'

import { IPCTestServer } from '@identity-box/utils'

import nacl from 'tweetnacl'
import fs from 'fs-extra'
import path from 'path'
import base64url from 'base64url'

describe('ServiceBroker', () => {
  const serializerFileDir = path.resolve(process.cwd(), '.fixtures', 'idservice')

  let serializerFilePath
  let servicePath

  let serviceRegistry
  let serviceManager
  let serviceBroker

  let service

  const prepareServicePath = () => {
    const serviceId = base64url.encode(nacl.hash(nacl.randomBytes(10)))
    servicePath = `service-broker.${serviceId}`
  }

  const prepareFixtureFile = () => {
    const filename = base64url.encode(nacl.hash(nacl.randomBytes(10)))
    serializerFilePath = path.resolve(serializerFileDir, `${filename}.json`)
    fs.ensureDirSync(serializerFileDir)
    fs.removeSync(serializerFilePath)
  }

  beforeEach(async () => {
    prepareServicePath()
    prepareFixtureFile()
    service = await IPCTestServer.create(servicePath)
    serviceRegistry = new ServiceRegistry({
      serializerFilePath
    })
    serviceManager = new ServiceManager({ serviceRegistry })
    serviceBroker = new ServiceBroker({ serviceManager })
    serviceRegistry.register(servicePath)
  })

  afterEach(async () => {
    await service.isClientDisconnected()
    fs.removeSync(serializerFilePath)
  })

  it('dispatches request to the right service', async () => {
    const request = {
      method: 'some-method',
      servicePath,
      params: [{
        message: 'message'
      }]
    }
    const expectedResponse = service.queueExpectedResponse({
      method: `${request.method}-response`,
      servicePath: request.servicePath,
      params: [
        { message: `${request.params[0].message} response` }
      ]
    })

    const response = await serviceBroker.dispatch(request)

    expect(response).toEqual(expectedResponse)
  })

  it('dispatches request to the right service (empty params)', async () => {
    const request = {
      method: 'some-method',
      servicePath,
      params: []
    }
    const expectedResponse = service.queueExpectedResponse({
      method: `${request.method}-response`,
      servicePath: request.servicePath,
      params: [
        { message: 'empty params response' }
      ]
    })

    const response = await serviceBroker.dispatch(request)

    expect(response).toEqual(expectedResponse)
  })

  it('dispatches request to the right service (no params)', async () => {
    const request = {
      method: 'some-method',
      servicePath
    }
    const expectedResponse = service.queueExpectedResponse({
      method: `${request.method}-response`,
      servicePath: request.servicePath,
      params: [
        { message: 'no params response' }
      ]
    })

    const response = await serviceBroker.dispatch(request)

    expect(response).toEqual(expectedResponse)
  })

  it('does not brake if remote service returns non-compliant response format', async () => {
    const request = {
      method: 'some-method',
      servicePath
    }
    service.queueExpectedResponse(undefined)

    const response = await serviceBroker.dispatch(request)

    expect(response).toBeUndefined()
  })

  it('throws an error if service path is not registered', async () => {
    const request = {
      method: 'some-method',
      servicePath: 'non.existent'
    }

    const expectedError = new Error(`Service ${request.servicePath} is not registered!`)

    await expect(serviceBroker.dispatch(request)).rejects.toThrow(expectedError)
  })
})
