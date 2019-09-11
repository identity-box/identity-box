import nacl from 'tweetnacl'

const lpad = (str, padString, length) => {
  while (str.length < length) { str = padString + str }
  return str
}

const binaryToByte = bin => {
  return parseInt(bin, 2)
}

const bytesToBinary = bytes => {
  return bytes.map(x => lpad(x.toString(2), '0', 8)).join('')
}

const deriveChecksumBits = entropyBuffer => {
  const ENT = entropyBuffer.length * 8
  const CS = ENT / 32
  const hash = nacl.hash(entropyBuffer)
  return bytesToBinary(Array.from(hash)).slice(0, CS)
}

export {
  lpad,
  binaryToByte,
  bytesToBinary,
  deriveChecksumBits
}
