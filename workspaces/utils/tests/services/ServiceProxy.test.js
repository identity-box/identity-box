import { ServiceProxy } from '../../source/services'
import { IPCTestServer } from '../../source/test-utils'

import nacl from 'tweetnacl'
import base64url from 'base64url'

describe('ServiceProxy', () => {
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

  beforeEach(async () => {
    prepareServicePath()
    service = await IPCTestServer.create(servicePath)
  })

  afterEach(async () => {
    await service.isClientDisconnected()
  })

  it('executes remote procedure on the remote server', async () => {
    const expectedResponse = service.queueExpectedResponse({
      method: `${rpcRequest.method}-response`,
      params: [
        { message: `${rpcRequest.params[0].message}-response` }
      ]
    })
    const serviceProxy = new ServiceProxy(servicePath)

    const response = await serviceProxy.send(rpcRequest)

    expect(response.id).toBe(servicePath)
    expect(response.response).toEqual(expectedResponse)
  })
})
