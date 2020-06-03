import { NameResolver } from '../../source/services/NameResolver'

describe('NameResolver', () => {
  const ipnsName = 'ipnsName'
  const publishedCid = 'cid'
  let nameResolver
  let ipfs
  let subscribeMock
  let unsubscribeMock
  let subscribeHandler

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
