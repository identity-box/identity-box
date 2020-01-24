import { NameService } from '../../src/entry-point'
import { Server } from '../../src/server'
import request from 'supertest'
import path from 'path'
import ipfsClient from 'ipfs-http-client'
import fs from 'fs'

jest.mock('fs')
jest.mock('ipfs-http-client')

describe('Name Service', () => {
  const filePath = path.resolve(process.cwd(), 'Identities.json')
  let server
  let app
  let publishMock
  let nameservice
  let mockIpfsClient
  let apiUrl

  beforeEach(() => {
    fs.writeFileSync.mockReset()
    fs.readFileSync.mockReset()
    fs.existsSync.mockReset()
    publishMock = jest.fn().mockResolvedValue(null)
    mockIpfsClient = {
      pubsub: {
        publish: publishMock
      }
    }
    ipfsClient.mockImplementation(api => {
      apiUrl = api
      return mockIpfsClient
    })
    nameservice = new NameService()
    server = new Server(nameservice)
    app = server.app
    jest.useFakeTimers()
    console.log = jest.fn()
  })

  afterEach(() => {
    nameservice.reset()
    publishMock.mockReset()
    console.log.mockRestore()
  })

  it('sets identities to empty object when state file does not exist', () => {
    fs.existsSync.mockReturnValue(false)
    nameservice = new NameService()
    expect(nameservice.identities).toEqual({})
  })

  it('reads identities from file when one exists', () => {
    const state = { ipnsName: 'cid' }
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(JSON.stringify(state))
    nameservice = new NameService()
    expect(nameservice.identities).toEqual(state)
  })

  it('immediately starts publishing names from file', async () => {
    const state = {
      ipnsName1: 'cid1',
      ipnsName2: 'cid2'
    }
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(JSON.stringify(state))
    nameservice = new NameService()

    expect(publishMock).not.toBeCalled()
    jest.runOnlyPendingTimers()
    expect(publishMock).toHaveBeenCalledTimes(2)
    expect(publishMock).toHaveBeenCalledWith('ipnsName1', Buffer.from('cid1'))
    expect(publishMock).toHaveBeenLastCalledWith('ipnsName2', Buffer.from('cid2'))
  })

  it('returns error message for unknown method request', async () => {
    const response = await request(app.callback())
      .post('/')
      .send({ method: 'blah' })

    expect(response.status).toEqual(200)
    expect(response.body.status).toBe('error')
    expect(response.body.message).toBe('unknown-method')
  })

  it('creates ipfs client interface with correct api url', () => {
    expect(apiUrl).toBe('/ip4/127.0.0.1/tcp/5001')
  })

  it('returns ipns name and cid requested to be published in publish-name request', async () => {
    const response = await request(app.callback())
      .post('/')
      .send({ method: 'publish-name', ipnsName: 'ipnsName', cid: 'cid' })

    expect(response.status).toEqual(200)
    expect(response.body.ipnsName).toBe('ipnsName')
    expect(response.body.cid).toBe('cid')
  })

  it('writes published name to file', async () => {
    await request(app.callback())
      .post('/')
      .send({ method: 'publish-name', ipnsName: 'ipnsName', cid: 'cid' })

    jest.runOnlyPendingTimers()

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      filePath,
      JSON.stringify({ ipnsName: 'cid' })
    )
  })

  it('starts publishing with correct time interval', async () => {
    await request(app.callback())
      .post('/')
      .send({ method: 'publish-name', ipnsName: 'ipnsName', cid: 'cid' })

    expect(setInterval).toHaveBeenCalledTimes(1)
    expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 10000)
  })

  it('starts publishing ipns name after receiving publish-name request', async () => {
    await request(app.callback())
      .post('/')
      .send({ method: 'publish-name', ipnsName: 'ipnsName', cid: 'cid' })

    expect(publishMock).not.toBeCalled()
    jest.runOnlyPendingTimers()
    jest.runOnlyPendingTimers()
    expect(publishMock).toHaveBeenCalledTimes(2)
  })
})
