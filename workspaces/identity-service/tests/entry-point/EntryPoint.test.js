import { EntryPoint } from '../../src/entry-point'
import { ServiceProxy, Service } from '@identity-box/utils'
import ipfsClient from 'ipfs-http-client'

import nacl from 'tweetnacl'
import base64url from 'base64url'

jest.mock('ipfs-http-client')

describe('EntryPoint', () => {
  const rpcRequest = {
    method: 'test-method'
  }

  let servicePath
  let registrationPath
  let entryPoint
  let registrationService
  let apiUrl

  const prepareServicePath = () => {
    const serviceId = base64url.encode(nacl.hash(nacl.randomBytes(10)))
    servicePath = `identity-box-nameservice.${serviceId}`
  }

  const prepareRegistrationPath = () => {
    const serviceId = base64url.encode(nacl.hash(nacl.randomBytes(10)))
    registrationPath = `identity-box-nameservice.${serviceId}`
  }

  beforeEach(() => {
    prepareServicePath()
    console.log = jest.fn()
  })

  afterEach(() => {
    entryPoint.stop()
    registrationService && registrationService.stop()
    console.log.mockRestore()
  })

  it('works', async () => {
    const expectedResponse = {
      method: 'unknown-method',
      params: []
    }
    entryPoint = new EntryPoint({ servicePath })

    await entryPoint.start()

    const serviceProxy = new ServiceProxy(servicePath)
    const { response } = await serviceProxy.send(rpcRequest)

    expect(response).toEqual(expectedResponse)
  })

  it('registers to the provided registration service', async () => {
    prepareRegistrationPath()
    const expectedRegistrationResponse = {
      method: 'register-response',
      params: [
        { servicePath }
      ]
    }
    registrationService = await Service.create({
      servicePath: registrationPath,
      onMessage: jest.fn().mockReturnValue(expectedRegistrationResponse)
    })

    entryPoint = new EntryPoint({
      servicePath,
      registrationPath
    })

    await entryPoint.start()

    expect(console.log).toHaveBeenCalledWith('registration successful')
  })

  it('prints received response on registration failure', async () => {
    prepareRegistrationPath()
    const expectedRegistrationResponse = {
      method: 'register-error',
      params: [
        { servicePath }
      ]
    }
    registrationService = await Service.create({
      servicePath: registrationPath,
      onMessage: jest.fn().mockReturnValue(expectedRegistrationResponse)
    })

    entryPoint = new EntryPoint({
      servicePath,
      registrationPath
    })

    await entryPoint.start()

    expect(console.log).toHaveBeenNthCalledWith(1, 'registration failed!')
    expect(console.log).toHaveBeenNthCalledWith(2, 'received:')
    expect(console.log).toHaveBeenNthCalledWith(3, JSON.stringify(expectedRegistrationResponse))
  })

  describe('ipfs client', () => {
    beforeEach(() => {
      ipfsClient.mockImplementation(api => {
        apiUrl = api
        return jest.fn()
      })
    })

    afterEach(() => {
      process.env.IPFS_ADDR && delete process.env.IPFS_ADDR
    })

    it('is created with default api address', async () => {
      entryPoint = new EntryPoint({ servicePath })

      await entryPoint.start()

      expect(entryPoint).toBeDefined()
      expect(apiUrl).toBe('/ip4/127.0.0.1/tcp/5001')
    })

    it('can use custom api address', async () => {
      process.env.IPFS_ADDR = '/dns4/some.ipfs.host/tcp/5001'
      entryPoint = new EntryPoint({ servicePath })

      await entryPoint.start()

      expect(apiUrl).toBe(process.env.IPFS_ADDR)
    })
  })
})
