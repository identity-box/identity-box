import { useState, useRef, useCallback } from 'react'
import base64url from 'base64url'

import { Start } from './Start'
import { FetchSecret } from './FetchSecret'
import { SenderPublicKey } from './SenderPublicKey'
import { ConnectIdApp } from './ConnectIdApp'
import { DecryptSecret } from './DecryptSecret'
import { PresentSecret } from './PresentSecret'
import { PresentError } from './PresentError'
import { useRendezvousTunnel } from '../rendezvous'

const rendezvousUrlGlobal = import.meta.env.VITE_HUSH_HUSH_RENDEZVOUS_URL

const Stages = Object.freeze({
  Start: Symbol('start'),
  FetchSecret: Symbol('fetchSecret'),
  SenderPublicKey: Symbol('senderPublicEncryptionKey'),
  ConnectIdApp: Symbol('connectIdApp'),
  DecryptSecret: Symbol('decryptSecret'),
  PresentSecret: Symbol('presentSecret'),
  PresentError: Symbol('presentError')
})

const ProcessSecret = ({ senderTagBase64 }) => {
  const rendezvousTunnel = useRef(undefined)
  const [rendezvousUrl, setRendezvousUrl] = useState('')
  const [workflow, setWorkflow] = useState(Stages.Start)
  const [cid, setCid] = useState(undefined)
  const [didRecipient, setDidRecipient] = useState(undefined)
  const [didSender, setDidSender] = useState(undefined)
  const [encryptedSecret, setEncryptedSecret] = useState(undefined)
  const [publicEncryptionKey, setPublicEncryptionKey] = useState(undefined)
  const [secret, setSecret] = useState(undefined)
  const [errorID, setErrorID] = useState(undefined)
  const [closeDialog, setCloseDialog] = useState(false)

  const onReady = useCallback(() => {
    console.log('Tunnel to IdApp established')
    setCloseDialog(true)
    setWorkflow(Stages.DecryptSecret)
  }, [])

  const onCreated = useCallback(
    ({ rendezvousTunnel: rt, rendezvousTunnelUrl: rendezvousUrl }) => {
      console.log('Tunnel to IdApp created')
      rendezvousTunnel.current = rt
      setRendezvousUrl(rendezvousUrl)
    },
    []
  )

  useRendezvousTunnel({
    url: rendezvousUrlGlobal,
    onCreated,
    onReady
  })

  const processLink = useCallback(() => {
    const [cidEncryptedSecret, didRecipient, didSender] = base64url
      .decode(senderTagBase64)
      .split('.')

    setCid(cidEncryptedSecret)
    setDidRecipient(didRecipient)
    setDidSender(didSender)
  }, [senderTagBase64])

  const processDIDDocument = (didDocument) => {
    const publicEncryptionKeys = didDocument.publicKey.filter(
      (pk) => pk.type === 'ECDHPublicKey' && pk.status !== 'revoked'
    )
    if (publicEncryptionKeys && publicEncryptionKeys.length > 0) {
      const publicEncryptionKey = publicEncryptionKeys[0].publicKeyBase64
      console.log('publicEncryptionKey:', publicEncryptionKey)
      setPublicEncryptionKey(publicEncryptionKey)
    }
  }

  const next1 = useCallback(() => {
    processLink()
    setWorkflow(Stages.FetchSecret)
  }, [processLink])

  const renderStart = useCallback(() => {
    return <Start next={next1} />
  }, [next1])

  const next2 = useCallback((json) => {
    console.log('json=', json)
    setEncryptedSecret(json)
    setTimeout(() => {
      setWorkflow(Stages.SenderPublicKey)
    }, 2000)
  }, [])

  const renderFetchSecret = useCallback(() => {
    return <FetchSecret cid={cid} baseUrl={rendezvousUrlGlobal} next={next2} />
  }, [cid, next2])

  const next3 = useCallback((didDocument) => {
    console.log('didDocument=', didDocument)
    processDIDDocument(didDocument)
    setTimeout(() => {
      setWorkflow(Stages.ConnectIdApp)
    }, 2000)
  }, [])

  const renderSenderPublicKey = useCallback(() => {
    return (
      <SenderPublicKey
        did={didSender}
        baseUrl={rendezvousUrlGlobal}
        next={next3}
      />
    )
  }, [didSender, next3])

  const renderConnectIdApp = useCallback(() => {
    return (
      <ConnectIdApp rendezvousUrl={rendezvousUrl} closeDialog={closeDialog} />
    )
  }, [rendezvousUrl, closeDialog])

  const next4 = useCallback(({ secret, errorID }) => {
    if (errorID) {
      console.log('errorID=', errorID)
      setErrorID(errorID)
      setTimeout(() => {
        setWorkflow(Stages.PresentError)
      }, 2000)
    } else {
      console.log('secret=', secret)
      setSecret(secret)
      setTimeout(() => {
        setWorkflow(Stages.PresentSecret)
      }, 2000)
    }
  }, [])

  const renderDecryptSecret = useCallback(() => {
    return (
      <DecryptSecret
        rendezvousTunnel={rendezvousTunnel.current}
        encryptedSecret={encryptedSecret}
        didRecipient={didRecipient}
        theirPublicKey={publicEncryptionKey}
        next={next4}
      />
    )
  }, [encryptedSecret, didRecipient, publicEncryptionKey, next4])

  const renderPresentSecret = useCallback(() => {
    return <PresentSecret secret={secret} />
  }, [secret])

  const renderPresentError = useCallback(() => {
    return <PresentError errorID={errorID} />
  }, [errorID])

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
    case Stages.PresentError:
      return renderPresentError()
    default:
      return null
  }
}

export { ProcessSecret }
