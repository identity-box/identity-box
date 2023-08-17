import nacl from 'tweetnacl'

const lpad = (str: string, padString: string, length: number) => {
  while (str.length < length) {
    str = padString + str
  }
  return str
}

const binaryToByte = (bin: string) => {
  return parseInt(bin, 2)
}

const bytesToBinary = (bytes: number[]) => {
  return bytes.map((x) => lpad(x.toString(2), '0', 8)).join('')
}

const deriveChecksumBits = (entropyBuffer: Uint8Array) => {
  const ENT = entropyBuffer.length * 8
  const CS = ENT / 32
  const hash = nacl.hash(entropyBuffer)
  return bytesToBinary(Array.from(hash)).slice(0, CS)
}

export { lpad, binaryToByte, bytesToBinary, deriveChecksumBits }
