import { TypedArrays } from '@react-frontend-developer/buffers'
import { CID } from 'multiformats/cid'
import { base36 } from 'multiformats/bases/base36'

import { NameResolver } from '../../source/services/NameResolver'

describe('NameResolver', () => {
  const ipnsName = 'ipnsName'
  const publishedCid = 'cid'
  const qmName = 'QmU9PcKHfWAgsckymPBnKxoTyt5SNQmZV2HSdBfbvadTMH'
  let nameResolver
  let ipfs
  let subscribeMock
  let unsubscribeMock
  let subscribeHandler

  const toBase36 = ipnsName => {
    // const cidB58 = new CID(ipnsName)
    // const cidBase36 = new CID(1, 'libp2p-key', cidB58.multihash, 'base36')
    // return cidBase36.toString()
    const libp2pKey = {
      code: 0x72,
      name: 'libp2p-key'
    }
    const v0 = CID.parse(ipnsName)
    const v1 = CID.create(1, libp2pKey.code, v0.multihash, v0.bytes)
    return v1.toString(base36.encoder)
  }

  beforeEach(() => {
    jest.useFakeTimers()
    console.log = jest.fn()
    subscribeMock = jest.fn()
    unsubscribeMock = jest.fn()
    ipfs = {
      pubsub: {
        subscribe: subscribeMock,
        unsubscribe: unsubscribeMock
      }
    }
    nameResolver = new NameResolver(ipfs)
  })

  afterEach(() => {
    jest.runAllTimers()
    subscribeMock.mockReset()
    unsubscribeMock.mockReset()
    console.log.mockRestore()
  })

  it('resolves the published name', async () => {
    subscribeMock.mockImplementation((ipnsName, handler) => {
      setTimeout(() => {
        handler({
          data: Buffer.from(publishedCid)
        })
      }, 0)
      return Promise.resolve()
    })
    unsubscribeMock.mockResolvedValue(null)
    const promise = nameResolver.resolve({ ipnsName })
    jest.advanceTimersByTime(1)
    const response = await promise
    expect(response.ipnsName).toBe('ipnsName')
    expect(response.cid).toBe(publishedCid)
  })

  it('converts the name to be resolved to new base36 format', async () => {
    let subscribedIpnsName
    subscribeMock.mockImplementation((ipnsName, handler) => {
      subscribedIpnsName = ipnsName
      setTimeout(() => {
        handler({
          data: TypedArrays.string2Uint8Array(publishedCid, 'utf8')
        })
      }, 0)
      return Promise.resolve()
    })
    unsubscribeMock.mockResolvedValue(null)
    const promise = nameResolver.resolve({ ipnsName: qmName })
    jest.advanceTimersByTime(1)
    const response = await promise
    expect(subscribedIpnsName).toBe(toBase36(qmName))
    expect(response.ipnsName).toBe(toBase36(qmName))
    console.log(response.cid)
    console.log(publishedCid)
    expect(response.cid).toBe(publishedCid)
  })

  it('returns error when name cannot be resolved', async () => {
    const promise = nameResolver.resolve({ ipnsName })

    jest.advanceTimersByTime(15000)

    const response = await promise

    expect(response.status).toBe('error')
    expect(response.message).toBe(`Could not resolve name: ${ipnsName}`)
  })

  it('unsubscribes from the ipns name topic if name cannot be resolved', async () => {
    subscribeMock.mockImplementation((ipnsName, handler) => {
      subscribeHandler = handler
      return Promise.resolve()
    })
    const promise = nameResolver.resolve({ ipnsName })

    jest.advanceTimersByTime(15000)

    await promise

    expect(subscribeMock).toHaveBeenCalledWith(ipnsName, subscribeHandler)
  })
})
