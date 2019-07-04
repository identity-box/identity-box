import { Buffers } from '@react-frontend-developer/buffers'
import { readConfiguration } from './readConfiguration'
import fs from 'fs'
import base64url from 'base64url'

jest.mock('fs')

const examplePath = 'path-to-telepath-configuration'

test('reading configuration when no previous configuration exists', () => {
  fs.existsSync.mockReturnValueOnce(false)
  expect(readConfiguration(examplePath)).toBeUndefined()
})

test('uses the provided path of the telepath configuration file', () => {
  readConfiguration(examplePath)
  expect(fs.existsSync.mock.calls[0][0]).toBe(examplePath)
})

test('returns a telepath configuration object if telepath configuration file exists', () => {
  fs.existsSync.mockReturnValueOnce(true)
  fs.readFileSync.mockReturnValueOnce('fJK-eE00xRj1d1ymOjgqXTJc zEGXHN9MhNjEWU1xTacF-MudYAN5Xxs7rRAI2ENxDtY SWRCb3gtMQ aHR0cHM6Ly9jb2dpdG8ubW9iaS90ZWxlcGF0aC9jb25uZWN0I0k9Q0FLdlJNTHhuTGdoTkQ1RVdqMXRuM0VpJkU9OUpYdXVtVm1sRFF5SWJxWkZQckc2S3VjLTVQRkZPczhoZHlySExReHVCWSZBPVNXUkNiM2d0TVE')
  const telepathConfiguration = readConfiguration(examplePath)
  expect(telepathConfiguration).toEqual({
    channelId: 'fJK-eE00xRj1d1ymOjgqXTJc',
    channelKey: Buffers.copyToUint8Array(base64url.toBuffer('zEGXHN9MhNjEWU1xTacF-MudYAN5Xxs7rRAI2ENxDtY')),
    appName: base64url.decode('SWRCb3gtMQ'),
    connectUrl: base64url.decode('aHR0cHM6Ly9jb2dpdG8ubW9iaS90ZWxlcGF0aC9jb25uZWN0I0k9Q0FLdlJNTHhuTGdoTkQ1RVdqMXRuM0VpJkU9OUpYdXVtVm1sRFF5SWJxWkZQckc2S3VjLTVQRkZPczhoZHlySExReHVCWSZBPVNXUkNiM2d0TVE')
  })
})
