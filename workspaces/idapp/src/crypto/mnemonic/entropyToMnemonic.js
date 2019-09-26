import { wordlist } from './wordlist'
import {
  binaryToByte,
  bytesToBinary,
  deriveChecksumBits
} from './mnemonicUtils'

const entropyToMnemonic = entropy => {
  const entropyBits = bytesToBinary(Array.from(entropy))
  const checksumBits = deriveChecksumBits(entropy)
  const bits = entropyBits + checksumBits
  const chunks = bits.match(/(.{1,11})/g)
  const words = chunks.map(binary => {
    const index = binaryToByte(binary)
    return wordlist[index]
  })
  return words.join(' ')
}

export { entropyToMnemonic }
