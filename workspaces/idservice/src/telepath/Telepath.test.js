import fs from 'fs'
import base64url from 'base64url'
import { Telepath } from './Telepath'

jest.mock('fs')

describe('Telepath', () => {
  const path = 'path-to-telepath-configuration'
  const queuingServiceUrl = 'https://telepath.cogito.mobi'
  const baseUrl = 'https://cogito.mobi'
  let telepath

  beforeEach(() => {
    fs.writeFileSync.mockReset()
    fs.readFileSync.mockReset()
    console.log = jest.fn()
  })

  afterEach(() => {
    console.log.mockRestore()
  })

  describe('when configuration file does not exist', () => {
    beforeEach(() => {
      fs.existsSync.mockReturnValueOnce(false)
      telepath = new Telepath({
        path,
        queuingServiceUrl,
        baseUrl
      })
    })

    it('creates a fresh telepath channel', () => {
      expect(telepath).toBeDefined()
    })

    it('creates a fresh telepath channel with correct appName', () => {
      expect(telepath.appName).toBe('IdentityBox')
    })

    it('writes the newly created telepath channel configuration to a file', () => {
      const { id, key, appName, clientId } = telepath

      expect(fs.writeFileSync.mock.calls[0][0]).toBe(path)
      expect(fs.writeFileSync.mock.calls[0][1]).toBe(`${id} ${base64url.encode(key)} ${base64url.encode(appName)} ${clientId}`)
    })
  })

  describe('when configuration file does exists', () => {
    const id = 'KTVrx3lrSBhknui7AESYzuXi'
    const base64encodedKey = 'JZsK4nWYckf7fFuXdqyVq88_yLEt6bKwckAUAkxguHQ'
    const base64encodedAppName = 'SWRlbnRpdHlCb3g'

    beforeEach(() => {
      fs.existsSync.mockReturnValueOnce(true)
      fs.readFileSync.mockReturnValueOnce(`${id} ${base64encodedKey} ${base64encodedAppName}`)
      telepath = new Telepath({
        path,
        queuingServiceUrl,
        baseUrl
      })
    })

    it('reads the configuration from the correct file', () => {
      expect(fs.readFileSync.mock.calls[0][0]).toBe(path)
      expect(fs.readFileSync.mock.calls[0][1]).toBe('UTF-8')
    })

    it('returns telepath channel corresponding to the retrieved configuration data', () => {
      expect(telepath.id).toBe(id)
      expect(base64url.encode(telepath.key)).toBe(base64encodedKey)
      expect(base64url.encode(telepath.appName)).toBe(base64encodedAppName)
    })
  })
})
