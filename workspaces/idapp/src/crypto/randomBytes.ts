import * as Crypto from 'expo-crypto'

const randomBytes = async (byteCount: number) => {
  return Crypto.getRandomBytesAsync(byteCount)
}

export { randomBytes }
