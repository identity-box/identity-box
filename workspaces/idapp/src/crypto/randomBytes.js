import * as Random from 'expo-random'

const randomBytes = byteCount => {
  return Random.getRandomBytesAsync(byteCount)
}

export { randomBytes }
