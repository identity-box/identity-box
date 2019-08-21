import React, { useState, useCallback } from 'react'
import { IdAppConnect } from './IdAppConnect'
import { Recipient } from './Recipient'
import { EnterSecret } from './EnterSecret'
import { FetchDidDocument } from './FetchDiDDocument'
import { EncryptSecret } from './EncryptSecret'
import { CreateLink } from './CreateLink'

import { useTelepath } from '../telepath'

const Stages = Object.freeze({
  Connect: Symbol('connecting'),
  Recipient: Symbol('gettingRecipient'),
  RecipientDIDDocument: Symbol('recipientDIDDocument'),
  EncryptSecret: Symbol('encryptingSecretWithRecipientPublicKey'),
  CreateLink: Symbol('createLink'),
  Invite: Symbol('inviteRecipient'),
  Inviting: Symbol('invitingProgress'),
  Pending: Symbol('invitationPending'),
  Secret: Symbol('gettingSecret'),
  RecipientKey: Symbol('checkingIfRecipientKeyIsInTheBin'),
  Hush: Symbol('hushing')
})

const SenderHush = () => {
  const [workflow, setWorkflow] = useState(Stages.Connect)
  const [telepathChannel, setTelepathChannel] = useState(undefined)
  const [did, setDid] = useState(undefined)
  const [secret, setSecret] = useState(undefined)
  const [publicEncryptionKey, setPublicEncryptionKey] = useState(undefined)
  const [cid, setCID] = useState(undefined)
  const [idBoxTransientTelepath, setIdBoxTransientTelepath] = useState({})

  const onRecipientReady = useCallback(async ({ did }) => {
    console.log('got your recipient DID:', did)
    setDid(did)
    setWorkflow(Stages.Secret)
  }, [telepathChannel])

  const onSecretReady = useCallback(async ({ secret }) => {
    console.log('got your secret:', secret)
    setSecret(secret)
    setWorkflow(Stages.RecipientDIDDocument)
  }, [])

  const onConnected = useCallback(telepathChannel => {
    console.log('Connected to IdApp')
    setTelepathChannel(telepathChannel)
    setWorkflow(Stages.Recipient)
  }, [])

  const onDIDDocumentRetrieved = useCallback(didDocument => {
    console.log('DID Document:', didDocument)
    const publicEncryptionKeys = didDocument.publicKey.filter(pk => pk.type === 'ECDHPublicKey' && pk.status !== 'revoked')
    if (publicEncryptionKeys && publicEncryptionKeys.length > 0) {
      const publicEncryptionKey = publicEncryptionKeys[0].publicKeyBase64
      console.log('publicEncryptionKey:', publicEncryptionKey)
      setPublicEncryptionKey(publicEncryptionKey)
      setWorkflow(Stages.EncryptSecret)
    }
  }, [])

  const onEncryptedCIDRetrieved = useCallback(cid => {
    console.log('Encrypted Secret CID:', cid)
    setCID(cid)
    setWorkflow(Stages.CreateLink)
  }, [])

  const renderConnect = () => {
    return (
      <IdAppConnect onConnected={onConnected} />
    )
  }

  const renderRecipient = () => {
    return (
      <Recipient onRecipientReady={onRecipientReady} telepathChannel={telepathChannel} />
    )
  }

  const renderEnterSecret = () => {
    return (
      <EnterSecret did={did} onSecretReady={onSecretReady} />
    )
  }

  const renderRecipientDIDDocument = () => {
    return (
      <FetchDidDocument onDIDDocumentRetrieved={onDIDDocumentRetrieved}
        did={did}
        idBoxTransientTelepathName={idBoxTransientTelepath.appName} />
    )
  }

  const renderEncryptSecret = () => {
    return (
      <EncryptSecret onEncryptedCIDRetrieved={onEncryptedCIDRetrieved}
        encryptionKey={publicEncryptionKey}
        secret={secret}
        idappTelepathChannel={telepathChannel}
        idBoxTransientTelepathName={idBoxTransientTelepath.appName} />
    )
  }

  const renderCreateLink = () => {
    return (
      <CreateLink cid={cid} did={did} />
    )
  }

  const onTelepathReady = useCallback(async ({ telepathProvider }) => {
    const message = {
      jsonrpc: '2.0',
      method: 'create-new-telepath-channel',
      params: []
    }
    try {
      await telepathProvider.emit(message)
    } catch (e) {
      console.log(e.message)
    }
  }, [])

  useTelepath({
    name: 'idbox',
    onTelepathReady: onTelepathReady,
    onMessage: message => {
      console.log('message received:', message.method)
      if (message.method === 'create-new-telepath-channel-response' && message.params.length > 0) {
        const idBoxTransientTelepath = message.params[0]
        console.log('idboxTransientTelepath', idBoxTransientTelepath)
        setIdBoxTransientTelepath(idBoxTransientTelepath)
      }
    },
    onError: error => {
      console.log(error)
    }
  })

  useTelepath({
    name: idBoxTransientTelepath.appName,
    channelDescription: idBoxTransientTelepath,
    transient: true,
    onTelepathReady: () => {
      console.log('transient idbox telepath created successfully')
    },
    onError: error => {
      console.log(error)
    }
  }, [idBoxTransientTelepath])

  switch (workflow) {
    case Stages.Connect:
      return renderConnect()
    case Stages.Recipient:
      return renderRecipient()
    case Stages.Secret:
      return renderEnterSecret()
    case Stages.RecipientDIDDocument:
      return renderRecipientDIDDocument()
    case Stages.EncryptSecret:
      return renderEncryptSecret()
    case Stages.CreateLink:
      return renderCreateLink()
    default:
      return null
  }
}

export { SenderHush }
