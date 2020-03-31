import { ServiceProxy, Service } from '../../source/services'

import nacl from 'tweetnacl'
import base64url from 'base64url'

describe('Service', () => {
  const rpcRequest = {
    method: 'serviceMethod',
    params: [
      { message: 'message' }
    ]
  }

  let servicePath
  let service

  const prepareServicePath = () => {
    const serviceId = base64url.encode(nacl.hash(nacl.randomBytes(10)))
    servicePath = `utils.${serviceId}`
  }

  beforeEach(() => {
    prepareServicePath()
  })

  afterEach(() => {
    if (service) {
      service.stop()
    }
  })

  it('returns response returned from registered onMessage handler', async () => {
    const expectedResponse = {
      method: `${rpcRequest.method}-response`,
      params: [
        { message: 'hello' }
      ]
    }
    service = await Service.create({
      servicePath,
      onMessage: async () => {
        return Promise.resolve(expectedResponse)
      }
    })

    const serviceProxy = new ServiceProxy(servicePath)

    const response = await serviceProxy.send(rpcRequest)

    expect(response.id).toBe(servicePath)
    expect(response.response).toEqual(expectedResponse)
  })

  it('returns response returned from registered onMessage handler - handler does not have to be async', async () => {
    const expectedResponse = {
      method: `${rpcRequest.method}-response`,
      params: [
        { message: 'hello' }
      ]
    }
    service = await Service.create({
      servicePath,
      onMessage: async () => {
        return expectedResponse
      }
    })

    const serviceProxy = new ServiceProxy(servicePath)

    const response = await serviceProxy.send(rpcRequest)

    expect(response.id).toBe(servicePath)
    expect(response.response).toEqual(expectedResponse)
  })

  it('returns an error response when no message handler has been associated', async () => {
    service = await Service.create({
      servicePath
    })

    const serviceProxy = new ServiceProxy(servicePath)

    const response = await serviceProxy.send(rpcRequest)

    expect(response.id).toBe(servicePath)
    expect(response.response).toEqual({
      method: `${rpcRequest.method}-error`,
      params: [
        { message: 'Service has no associated method handler!' }
      ]
    })
  })

  it('returns an error response when registered handler throws', async () => {
    const message = 'onMessage has thrown!'
    service = await Service.create({
      servicePath,
      onMessage: () => {
        throw new Error(message)
      }
    })

    const serviceProxy = new ServiceProxy(servicePath)

    const response = await serviceProxy.send(rpcRequest)

    expect(response.id).toBe(servicePath)
    expect(response.response).toEqual({
      method: `${rpcRequest.method}-error`,
      params: [
        { message }
      ]
    })
  })

  it('returns an error response when no message handler has been associated and no method has been given', async () => {
    service = await Service.create({
      servicePath
    })

    const serviceProxy = new ServiceProxy(servicePath)

    const response = await serviceProxy.send()

    expect(response.id).toBe(servicePath)
    expect(response.response).toEqual({
      method: 'rpc-error',
      params: [
        { message: 'Service has no associated method handler!' }
      ]
    })
  })
})
