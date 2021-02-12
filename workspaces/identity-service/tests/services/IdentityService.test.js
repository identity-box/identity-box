import { ServiceProxy } from '@identity-box/utils'
import nacl from 'tweetnacl'
import base64url from 'base64url'

import { IdentityService } from '../../source/services/IdentityService'

describe('IdentityService', () => {
  const testParam = 'testParam'
  const rpcRequest = {
    method: 'test-method',
    params: [
      { testParam }
    ]
  }

  let servicePath
  let identityService

  const prepareServicePath = () => {
    const serviceId = base64url.encode(nacl.hash(nacl.randomBytes(10)))
    servicePath = `identity-box-nameservice.${serviceId}`
  }

  beforeEach(() => {
    prepareServicePath()
  })

  afterEach(() => {
    identityService.stop()
  })

  it('delegates processing to the Dispatcher', async () => {
    const expectedResponse = {
      method: `${rpcRequest.method}-response`,
      params: [
        { message: `${rpcRequest.params[0].message}-response` }
      ]
    }
    const dispatcher = {
      dispatch: jest.fn().mockReturnValueOnce(expectedResponse)
    }
    identityService = await IdentityService.create({
      servicePath,
      dispatcher
    })

    const serviceProxy = new ServiceProxy(servicePath)
    await serviceProxy.send(rpcRequest)

    expect(dispatcher.dispatch).toHaveBeenCalledWith(rpcRequest)
  })

  it('returns the response provided by the Dispatcher', async () => {
    const expectedResponse = {
      method: `${rpcRequest.method}-response`,
      params: [
        { message: `${rpcRequest.params[0].message}-response` }
      ]
    }
    const dispatcher = {
      dispatch: jest.fn().mockReturnValueOnce(expectedResponse)
    }
    identityService = await IdentityService.create({
      servicePath,
      dispatcher
    })

    const serviceProxy = new ServiceProxy(servicePath)
    const response = await serviceProxy.send(rpcRequest)

    expect(response.response).toEqual(expectedResponse)
  })

  it('returns error response if Dispatcher throws', async () => {
    const expectedErrorMessage = 'error message'
    const expectedResponse = {
      method: `${rpcRequest.method}-error`,
      params: [
        { message: expectedErrorMessage }
      ]
    }
    const dispatcher = {
      dispatch: function () {
        throw new Error(expectedErrorMessage)
      }
    }
    identityService = await IdentityService.create({
      servicePath,
      dispatcher
    })

    const serviceProxy = new ServiceProxy(servicePath)
    const response = await serviceProxy.send(rpcRequest)

    expect(response.response).toEqual(expectedResponse)
  })
})
