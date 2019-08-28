import React, { useState, useCallback } from 'react'
import base64url from 'base64url'

import { Start } from './Start'
import { FetchSecret } from './FetchSecret'
import { SenderPublicKey } from './SenderPublicKey'
import { ConnectIdApp } from './ConnectIdApp'
import { DecryptSecret } from './DecryptSecret'
import { PresentSecret } from './PresentSecret'

const Stages = Object.freeze({
  Start: Symbol('start'),
  FetchSecret: Symbol('fetchSecret'),
  SenderPublicKey: Symbol('senderPublicEncryptionKey'),
  ConnectIdApp: Symbol('connectIdApp'),
  DecryptSecret: Symbol('decryptSecret'),
  PresentSecret: Symbol('presentSecret')
})

const ProcessSecret = ({ senderTagBase64 }) => {
  const [workflow, setWorkflow] = useState(Stages.Start)
  const [cid, setCid] = useState(undefined)
  const [didRecipient, setDidRecipient] = useState(undefined)
  const [didSender, setDidSender] = useState(undefined)
  const [encryptedSecret, setEncryptedSecret] = useState(undefined)
  const [publicEncryptionKey, setPublicEncryptionKey] = useState(undefined)
  const [telepathChannel, setTelepathChannel] = useState(undefined)
  const [secret, setSecret] = useState(undefined)

  const processLink = () => {
    const [cidEncryptedSecret, didRecipient, didSender] = base64url.decode(senderTagBase64).split('.')

    setCid(cidEncryptedSecret)
    setDidRecipient(didRecipient)
    setDidSender(didSender)
  }

  const processDIDDocument = didDocument => {
    const publicEncryptionKeys = didDocument.publicKey.filter(pk => pk.type === 'ECDHPublicKey' && pk.status !== 'revoked')
    if (publicEncryptionKeys && publicEncryptionKeys.length > 0) {
      const publicEncryptionKey = publicEncryptionKeys[0].publicKeyBase64
      console.log('publicEncryptionKey:', publicEncryptionKey)
      setPublicEncryptionKey(publicEncryptionKey)
    }
  }

  const renderStart = useCallback(() => {
    return (
      <Start next={() => {
        processLink()
        setWorkflow(Stages.FetchSecret)
      }} />
    )
  }, [])

  const renderFetchSecret = useCallback(() => {
    return (
      <FetchSecret cid={cid} next={json => {
        console.log('json=', json)
        setEncryptedSecret(json)
        setTimeout(() => {
          setWorkflow(Stages.SenderPublicKey)
        }, 2000)
      }} />
    )
  }, [cid])

  const renderSenderPublicKey = useCallback(() => {
    return (
      <SenderPublicKey did={didSender} next={didDocument => {
        console.log('didDocument=', didDocument)
        processDIDDocument(didDocument)
        setTimeout(() => {
          setWorkflow(Stages.ConnectIdApp)
        }, 2000)
      }} />
    )
  }, [didSender])

  const renderConnectIdApp = useCallback(() => {
    return (
      <ConnectIdApp next={telepathChannel => {
        console.log('connected to IdApp')
        console.log('tp=', telepathChannel)
        setTelepathChannel(telepathChannel)
        setWorkflow(Stages.DecryptSecret)
      }} />
    )
  }, [])

  const renderDecryptSecret = useCallback(() => {
    return (
      <DecryptSecret telepathChannel={telepathChannel}
        encryptedSecret={encryptedSecret}
        didRecipient={didRecipient}
        theirPublicKey={publicEncryptionKey}
        next={({ secret }) => {
          console.log('secret=', secret)
          setSecret(secret)
          setTimeout(() => {
            setWorkflow(Stages.PresentSecret)
          }, 2000)
        }} />
    )
  }, [telepathChannel])

  const renderPresentSecret = useCallback(() => {
    return (
      <PresentSecret secret={secret} />
    )
  }, [secret])

  switch (workflow) {
    case Stages.Start:
      return renderStart()
    case Stages.FetchSecret:
      return renderFetchSecret()
    case Stages.SenderPublicKey:
      return renderSenderPublicKey()
    case Stages.ConnectIdApp:
      return renderConnectIdApp()
    case Stages.DecryptSecret:
      return renderDecryptSecret()
    case Stages.PresentSecret:
      return renderPresentSecret()
    default:
      return null
  }
}

export { ProcessSecret }
