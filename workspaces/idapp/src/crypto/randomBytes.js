import * as Crypto from 'expo-crypto'

const randomBytes = async (byteCount) => {
  return Crypto.getRandomBytesAsync(byteCount)
}

export { randomBytes }
