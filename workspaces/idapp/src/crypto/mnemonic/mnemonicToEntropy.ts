import { wordlist } from './wordlist'
import { lpad, binaryToByte, deriveChecksumBits } from './mnemonicUtils'

const INVALID_MNEMONIC = 'Invalid mnemonic'
const INVALID_ENTROPY = 'Invalid entropy'
const INVALID_CHECKSUM = 'Invalid mnemonic checksum'

const normalize = (str: string) => {
  return (str || '').normalize('NFKD')
}

const mnemonicToEntropy = (mnemonic: string) => {
  const words = normalize(mnemonic).split(' ')

  const bits = words
    .map((word) => {
      const index = wordlist.indexOf(word)
      if (index === -1) {
        throw new Error(INVALID_MNEMONIC)
      }
      return lpad(index.toString(2), '0', 11)
    })
    .join('')

  const dividerIndex = Math.floor(bits.length / 33) * 32
  const entropyBits = bits.slice(0, dividerIndex)
  const checksumBits = bits.slice(dividerIndex)

  const entropyBytes = entropyBits?.match(/(.{1,8})/g)?.map(binaryToByte)

  if (!entropyBytes) {
    throw new Error(INVALID_ENTROPY)
  }
  if (entropyBytes.length < 16) {
    throw new Error(INVALID_ENTROPY)
  }
  if (entropyBytes.length > 32) {
    throw new Error(INVALID_ENTROPY)
  }
  if (entropyBytes.length % 4 !== 0) {
    throw new Error(INVALID_ENTROPY)
  }

  const entropy = Buffer.from(entropyBytes)
  const newChecksum = deriveChecksumBits(entropy)
  if (newChecksum !== checksumBits) {
    throw new Error(INVALID_CHECKSUM)
  }
  return entropy.toString('hex')
}

export { mnemonicToEntropy }
