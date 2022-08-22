import path from 'path'
import base32encode from 'base32-encode'
import { vi } from 'vitest'

import { IdentityProvider } from '../../source/services/IdentityProvider'

describe('Identity Provider', () => {
  it('produces correct key path given a name', () => {
    const ipfs = vi.fn()
    process.env.IPFS_PATH = '/some-base-path'
    const identityProvider = new IdentityProvider(ipfs)

    const name = 'test-name'
    const keyPath = identityProvider.getKeyPath(name)

    const encodedName = base32encode(Buffer.from(name), 'RFC4648', { padding: false })
    const expectedKeyPath = path.join(process.env.IPFS_PATH, 'keystore', `key_${encodedName.toLowerCase()}`)

    expect(keyPath).toBe(expectedKeyPath)
  })
})
