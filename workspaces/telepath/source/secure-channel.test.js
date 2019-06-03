import nacl from 'tweetnacl'
import base64url from 'base64url'
import { SecureChannel } from './secure-channel'
import { TypedArrays } from '@react-frontend-developer/buffers'

describe('Secure Channel', () => {
  const channelId = 'channel_id'
  const appName = 'Some app name with unicode characters ✅😎'

  let channel
  let socketIOChannel
  let key

  const enc = message => {
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength)
    const cypherText = nacl.secretbox(message, nonce, key)
    return Buffer.concat([nonce, cypherText])
  }

  beforeEach(() => {
    key = nacl.randomBytes(nacl.secretbox.keyLength)
    socketIOChannel = {
      start: jest.fn(),
      notify: jest.fn()
    }
    channel = new SecureChannel({
      id: channelId,
      key,
      appName,
      socketIOChannel
    })
  })

  it('encodes the channel id, key and app name in a URL', () => {
    const baseUrl = 'https://example.com'
    const encodedKey = base64url.encode(key)
    const encodedAppName = base64url.encode(appName)
    const url = `${baseUrl}/telepath/connect#I=${channelId}&E=${encodedKey}&A=${encodedAppName}`
    expect(channel.createConnectUrl(baseUrl)).toEqual(url)
  })

  describe('notifications', () => {
    const message = TypedArrays.string2Uint8Array('plain text message', 'utf8')

    it('encrypts the payload', () => {
      channel.notify(message)
      const nonceAndCypherText = new Uint8Array(
        socketIOChannel.notify.mock.calls[0][0]
      )
      const nonce = nonceAndCypherText.slice(0, nacl.secretbox.nonceLength)
      const cypherText = nonceAndCypherText.slice(nacl.secretbox.nonceLength)

      const decrypted = nacl.secretbox.open(cypherText, nonce, key)

      expect(decrypted).toEqual(message)
    })

    it('decrypts and forwards incoming notifications', async () => {
      const notificationSpy = jest.fn()
      await channel.startNotifications(notificationSpy)
      const data = enc(message)
      channel.onEncryptedNotification(data)
      expect(notificationSpy.mock.calls[0][0]).toEqual(message)
    })

    it('throws when notification handler is not set', () => {
      expect(() => channel.onEncryptedNotification()).toThrow()
    })
  })
})
