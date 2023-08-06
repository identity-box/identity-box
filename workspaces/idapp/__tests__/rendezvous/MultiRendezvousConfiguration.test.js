import * as SecureStore from 'expo-secure-store'
import { MultiRendezvousConfiguration } from '~/rendezvous'

jest.mock('expo-secure-store')

describe('MultiRendezvousConfiguration', () => {
  const name = 'idbox'
  const testUrl = 'testUrl'

  beforeEach(() => {
    SecureStore.getItemAsync.mockClear()
    console.log = jest.fn()
  })

  afterEach(() => {
    console.log.mockRestore()
  })

  it('restores the configuration from SecureStore if not previously restored', async () => {
    SecureStore.getItemAsync.mockResolvedValueOnce(testUrl)
    const multiRendezvousConfiguration = new MultiRendezvousConfiguration(name)
    const { url } = await multiRendezvousConfiguration.get()
    expect(url).toBe(testUrl)
    expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(1)
  })

  it('returns previously restored configuration on subsequent reads', async () => {
    SecureStore.getItemAsync.mockResolvedValueOnce(testUrl)
    const multiRendezvousConfiguration = new MultiRendezvousConfiguration(name)
    await multiRendezvousConfiguration.get()
    const { url } = await multiRendezvousConfiguration.get()
    expect(url).toBe(testUrl)
    expect(SecureStore.getItemAsync).toHaveBeenCalledTimes(1)
  })

  it('clears the url after the reset', async () => {
    SecureStore.getItemAsync.mockResolvedValueOnce('testUrl')
    SecureStore.getItemAsync.mockResolvedValueOnce(undefined)
    const multiRendezvousConfiguration = new MultiRendezvousConfiguration(name)
    let { url } = await multiRendezvousConfiguration.get()
    expect(url).toBe(testUrl)
    await multiRendezvousConfiguration.reset()
    ;({ url } = await multiRendezvousConfiguration.get())
    expect(url).toBeUndefined()
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1)
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      `rendezvousUrl-${name}`
    )
  })
})
