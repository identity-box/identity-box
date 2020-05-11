import { NamePublisher } from '../../src/services/NamePublisher'
import path from 'path'
import fs from 'fs'

jest.mock('fs')

describe('NamePublisher', () => {
  const filePath = path.resolve(process.cwd(), 'Identities.json')
  const ipnsName = 'ipnsName'
  const cid = 'cid'
  let namePublisher
  let publishMock
  let ipfs

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

    it('does not unsubscribe from the topic if the name was not previously published', async () => {
      await namePublisher.unpublish({ ipnsName })
      expect(unsubscribeMock).not.toBeCalled()
    })
  })
})
