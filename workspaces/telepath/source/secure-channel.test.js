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
    const cypherText = nacl.secretbox(
      TypedArrays.string2Uint8Array(message, 'utf8'),
      nonce,
      channel.key
    )
    return Buffer.concat([nonce, cypherText])
  }

  beforeEach(() => {
    key = nacl.randomBytes(nacl.secretbox.keyLength)
    socketIOChannel = {
      start: jest.fn(function ({ onMessage }) {
        this.onMessage = onMessage
      }),
      emit: jest.fn()
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

  describe('message subscriptions', () => {
    const message = 'plain text message'

    it('encrypts the payload', () => {
      channel.emit(message)
      const nonceAndCypherText = new Uint8Array(
        socketIOChannel.emit.mock.calls[0][0]
      )
      const nonce = nonceAndCypherText.slice(0, nacl.secretbox.nonceLength)
      const cypherText = nonceAndCypherText.slice(nacl.secretbox.nonceLength)

      const decrypted = nacl.secretbox.open(cypherText, nonce, key)

      expect(TypedArrays.uint8Array2string(decrypted, 'utf8')).toEqual(message)
    })

    it('decrypts and forwards incoming encrypted messages', async () => {
      const onMessage = jest.fn()
      await channel.subscribe(onMessage)
      const encryptedMessage = enc(message)
      socketIOChannel.onMessage(encryptedMessage)
      expect(onMessage.mock.calls[0][0]).toEqual(message)
    })

    it('throws when message handler is not set', () => {
      expect(() => socketIOChannel.onMessage()).toThrow()
    })
  })
})
