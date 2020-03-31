import { StateSerializer } from '../../source/state-serializer'
import fs from 'fs'

jest.mock('fs')

describe('StateSerializer', () => {
  const testPath = 'test-path'
  let serializer

  beforeEach(() => {
    fs.writeFileSync.mockReset()
    fs.readFileSync.mockReset()
    serializer = new StateSerializer(testPath)
    fs.existsSync = jest.fn().mockReturnValue(true)
  })

  it('returns undefined if file does not exist', () => {
    fs.existsSync = jest.fn().mockReturnValue(false)
    expect(serializer.read()).not.toBeDefined()
  })

  it('writes state to a file as JSON string', () => {
    const json = {
      ipnsName: 'cid'
    }

    serializer.write(json)

    expect(fs.writeFileSync).toHaveBeenCalledWith(testPath, JSON.stringify(json))
  })

  it('reads json state from file', () => {
    const json = {
      ipnsName: 'cid'
    }

    const jsonStr = JSON.stringify(json)

    fs.readFileSync.mockReturnValue(jsonStr)

    const readJson = serializer.read()

    expect(readJson).toEqual(json)
    expect(fs.readFileSync).toHaveBeenCalledWith(testPath, 'UTF-8')
  })
})
