import { NamePublisher } from '../../source/services/NamePublisher'
import path from 'path'
import fs from 'fs'
import CID from 'cids'

jest.mock('fs')

describe('NamePublisher', () => {
  const filePath = path.resolve(process.cwd(), 'Identities.json')
  const ipnsName = 'ipnsName'
  const cid = 'cid'
  const qmName1 = 'QmU9PcKHfWAgsckymPBnKxoTyt5SNQmZV2HSdBfbvadTMH'
  const qmName2 = 'QmbMPhfR6n7VSSBvKNGTu7dYM1HTk8rttU2E6apXTSg8Tx'
  let namePublisher
  let publishMock
  let ipfs

  const toBase36 = ipnsName => {
    const cidB58 = new CID(ipnsName)
    const cidBase36 = new CID(1, 'libp2p-key', cidB58.multihash, 'base36')
    return cidBase36.toString()
  }

  beforeEach(() => {
    fs.writeFileSync.mockReset()
    fs.readFileSync.mockReset()
    fs.existsSync.mockReset()
    jest.useFakeTimers()
    publishMock = jest.fn().mockResolvedValue(null)
    ipfs = {
      pubsub: {
        publish: publishMock
      }
    }
    console.log = jest.fn()
  })

  afterEach(() => {
    namePublisher.reset()
    jest.runAllTimers()
    console.log.mockRestore()
  })

  describe('publishing name', () => {
    beforeEach(() => {
      namePublisher = new NamePublisher(ipfs)
    })

    afterEach(() => {
      publishMock.mockReset()
    })

    it('sets identities to empty object when state file does not exist', () => {
      fs.existsSync.mockReturnValue(false)
      namePublisher = new NamePublisher(ipfs)
      expect(namePublisher.identities).toEqual({})
    })

    it('reads identities from file when one exists', () => {
      const state = { ipnsName: 'cid' }
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(state))
      namePublisher = new NamePublisher(ipfs)
      expect(namePublisher.identities).toEqual(state)
    })

    it('converts identities to base36 format when reading from file', () => {
      const state = {
        [`${qmName1}`]: 'cid1',
        [`${qmName2}`]: 'cid2'
      }
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(state))
      namePublisher = new NamePublisher(ipfs)
      expect(namePublisher.identities).toEqual({
        [`${toBase36(qmName1)}`]: 'cid1',
        [`${toBase36(qmName2)}`]: 'cid2'
      })
    })

    it('writes converted identities to file', () => {
      const state = {
        [`${qmName1}`]: 'cid1',
        [`${qmName2}`]: 'cid2'
      }
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(state))
      namePublisher = new NamePublisher(ipfs)
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        filePath,
        JSON.stringify({
          [`${toBase36(qmName1)}`]: 'cid1',
          [`${toBase36(qmName2)}`]: 'cid2'
        })
      )
    })

    it('immediately starts publishing names from file', () => {
      const state = {
        ipnsName1: 'cid1',
        ipnsName2: 'cid2'
      }
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(state))
      namePublisher = new NamePublisher(ipfs)

      expect(publishMock).not.toBeCalled()
      jest.runOnlyPendingTimers()
      expect(publishMock).toHaveBeenCalledTimes(2)
      expect(publishMock).toHaveBeenCalledWith('ipnsName1', Buffer.from('cid1'))
      expect(publishMock).toHaveBeenLastCalledWith('ipnsName2', Buffer.from('cid2'))
    })

    it('returns ipns name and cid requested to be published', () => {
      const response = namePublisher.publish({
        ipnsName,
        cid
      })

      expect(response.ipnsName).toBe(ipnsName)
      expect(response.cid).toBe(cid)
    })

    it('converts legacy base58 IPNS names to new base36 format when publishing', () => {
      const response = namePublisher.publish({
        ipnsName: qmName1,
        cid
      })

      jest.runOnlyPendingTimers()

      expect(response.ipnsName).toBe(toBase36(qmName1))
      expect(publishMock).toHaveBeenCalledWith(toBase36(qmName1), Buffer.from(cid))
    })

    it('writes published name to file', () => {
      namePublisher.publish({
        ipnsName,
        cid
      })

      jest.runOnlyPendingTimers()

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        filePath,
        JSON.stringify({ ipnsName: cid })
      )
    })

    it('writes converted published name to file', () => {
      namePublisher.publish({
        ipnsName: qmName1,
        cid
      })

      jest.runOnlyPendingTimers()

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        filePath,
        JSON.stringify({ [`${toBase36(qmName1)}`]: cid })
      )
    })

    it('starts publishing with correct time interval', () => {
      namePublisher.publish({
        ipnsName,
        cid
      })

      expect(setInterval).toHaveBeenCalledTimes(1)
      expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 10000)
    })

    it('starts publishing ipns name after receiving publish-name request', () => {
      namePublisher.publish({
        ipnsName,
        cid
      })

      expect(publishMock).not.toBeCalled()
      jest.runOnlyPendingTimers()
      jest.runOnlyPendingTimers()
      expect(publishMock).toHaveBeenCalledTimes(2)
    })
  })

  describe('unpublishing name', () => {
    let unsubscribeMock

    beforeEach(() => {
      publishMock = jest.fn().mockResolvedValue(null)
      unsubscribeMock = jest.fn().mockResolvedValue(null)
      ipfs = {
        pubsub: {
          publish: publishMock,
          unsubscribe: unsubscribeMock
        }
      }
      namePublisher = new NamePublisher(ipfs)
    })

    afterEach(() => {
      publishMock.mockReset()
      unsubscribeMock.mockReset()
    })

    it('stops publishing the topic after name has been unpublished', async () => {
      namePublisher.publish({
        ipnsName,
        cid
      })

      expect(publishMock).not.toBeCalled()
      jest.runOnlyPendingTimers()
      expect(publishMock).toHaveBeenCalledTimes(1)
      publishMock.mockClear()

      await namePublisher.unpublish({ ipnsName })
      jest.runOnlyPendingTimers()
      expect(publishMock).not.toBeCalled()
    })

    it('unsubscribes from the topic after name has been unpublished', async () => {
      namePublisher.publish({
        ipnsName,
        cid
      })

      jest.runOnlyPendingTimers()

      await namePublisher.unpublish({ ipnsName })
      expect(unsubscribeMock).toHaveBeenCalledTimes(1)
    })

    it('returns unpublished name after name has been unpublished', async () => {
      namePublisher.publish({
        ipnsName,
        cid
      })

      jest.runOnlyPendingTimers()

      const response = await namePublisher.unpublish({ ipnsName })

      expect(response.ipnsName).toBe(ipnsName)
    })

    it('converts legacy base58 IPNS name to a new base36 format when unpublishing', async () => {
      namePublisher.publish({
        ipnsName: qmName1,
        cid
      })

      jest.runOnlyPendingTimers()

      const response = await namePublisher.unpublish({ ipnsName: qmName1 })

      expect(response.ipnsName).toBe(toBase36(qmName1))
      expect(unsubscribeMock).toHaveBeenCalledWith(toBase36(qmName1))
    })

    it('does not unsubscribe from the topic if the name was not previously published', async () => {
      await namePublisher.unpublish({ ipnsName })
      expect(unsubscribeMock).not.toBeCalled()
    })
  })
})
