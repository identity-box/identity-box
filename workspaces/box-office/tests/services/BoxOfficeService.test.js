import fs from 'fs-extra'
import path from 'path'
import base64url from 'base64url'
import nacl from 'tweetnacl'
import { vi } from 'vitest'

import { ServiceProxy } from '@identity-box/utils'
import { ServiceRegistry } from '../../source/services/ServiceRegistry'

import { BoxOfficeService } from '../../source/services/BoxOfficeService'

describe('BoxOfficeService', () => {
  const externalServicePath = 'some-other.service-path'
  const registrationRequest = {
    method: 'register',
    params: [{ servicePath: externalServicePath }]
  }

  const serializerFileDir = path.resolve(
    process.cwd(),
    '.fixtures',
    'box-office'
  )

  let servicePath
  let serializerFilePath

  let registrationService
  let serviceRegistry

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
    console.log = vi.fn()
    prepareServicePath()
    prepareFixtureFile()
    serviceRegistry = new ServiceRegistry({
      serializerFilePath
    })
    registrationService = await BoxOfficeService.create({
      serviceRegistry,
      servicePath
    })
  })

  afterEach(() => {
    registrationService.stop()
    fs.removeSync(serializerFilePath)
    console.log.mockRestore()
  })

  it('allows external service registration', async () => {
    const serviceProxy = new ServiceProxy(servicePath)
    const response = await serviceProxy.send(registrationRequest)

    expect(response.response).toEqual({
      ...registrationRequest,
      method: `${registrationRequest.method}-response`
    })
  })

  it('returns an error response if external service is already registered', async () => {
    const serviceProxy = new ServiceProxy(servicePath)
    await serviceProxy.send(registrationRequest)
    const response = await serviceProxy.send(registrationRequest)

    expect(response.response).toEqual({
      method: 'register-error',
      params: [{ message: 'Service with given path already exists!' }]
    })
  })

  it('returns an error response on invalid method', async () => {
    const serviceProxy = new ServiceProxy(servicePath)
    const invalidRequest = {
      method: 'adhoc'
    }
    const response = await serviceProxy.send(invalidRequest)

    expect(response.response).toEqual({
      method: 'adhoc-error',
      params: [{ message: 'Service undefined is not registered!' }]
    })
  })

  it('returns an error response on invalid request', async () => {
    const serviceProxy = new ServiceProxy(servicePath)
    const response = await serviceProxy.send(undefined)

    expect(response.response).toEqual({
      method: 'rpc-error',
      params: [{ message: 'Service undefined is not registered!' }]
    })
  })
})
