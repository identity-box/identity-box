import { ServiceRegistry } from '../../src/services/ServiceRegistry'
import { ServiceManager } from '../../src/services/ServiceManager'
import nacl from 'tweetnacl'

import fs from 'fs-extra'
import path from 'path'
import base64url from 'base64url'
import { ServiceRegistrationService } from '../../src/services/ServiceRegistrationService'

describe('ServiceRegistrationService', () => {
  const externalServicePath = 'some-other.service-path'
  const registrationRequest = {
    method: 'register',
    params: [
      { servicePath: externalServicePath }
    ]
  }

  const serializerFileDir = path.resolve(process.cwd(), '.fixtures', 'idservice')

  let servicePath
  let serializerFilePath

  let registrationService
  let serviceRegistry
  let serviceManager

  const prepareServicePath = () => {
    const serviceId = base64url.encode(nacl.hash(nacl.randomBytes(10)))
    servicePath = `service-registration-service.${serviceId}`
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
    serviceRegistry = new ServiceRegistry({
      serializerFilePath
    })
    serviceManager = new ServiceManager({ serviceRegistry })
    registrationService = await ServiceRegistrationService.create({
      serviceRegistry,
      servicePath
    })
  })

  afterEach(() => {
    registrationService.stop()
    fs.removeSync(serializerFilePath)
  })

  it('registers itself as a service', async () => {
    expect(serviceRegistry.isRegistred(servicePath)).toBeTruthy()
  })

  it('allows external service registration', async () => {
    const serviceProxy = serviceManager.get(servicePath)
    const response = await serviceProxy.send(registrationRequest)

    expect(response.response).toEqual({
      ...registrationRequest,
      method: `${registrationRequest.method}-response`
    })
  })

  it('returns an error response if external service is already registered', async () => {
    const serviceProxy = serviceManager.get(servicePath)
    await serviceProxy.send(registrationRequest)
    const response = await serviceProxy.send(registrationRequest)

    expect(response.response).toEqual({
      method: 'register-error',
      params: [
        { message: 'Service with given path already exists!' }
      ]
    })
  })

  it('returns an error response on invalid method', async () => {
    const serviceProxy = serviceManager.get(servicePath)
    const invalidRequest = {
      method: 'adhoc'
    }
    const response = await serviceProxy.send(invalidRequest)

    expect(response.response).toEqual({
      method: 'register-error',
      params: [
        { message: 'RPC: unknown method' }
      ]
    })
  })

  it('returns an error response on invalid request', async () => {
    const serviceProxy = serviceManager.get(servicePath)
    const response = await serviceProxy.send(undefined)

    expect(response.response).toEqual({
      method: 'register-error',
      params: [
        { message: 'RPC: unknown method' }
      ]
    })
  })
})
