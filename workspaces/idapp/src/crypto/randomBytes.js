import * as Random from 'expo-random'

const randomBytes = async byteCount => {
  return Random.getRandomBytesAsync(byteCount)
}

export { randomBytes }
