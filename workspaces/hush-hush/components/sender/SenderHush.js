import { useState, useRef, useCallback } from 'react'
import { IdAppConnect } from './IdAppConnect'
import { Recipient } from './Recipient'
import { EnterSecret } from './EnterSecret'
import { FetchDidDocument } from './FetchDiDDocument'
import { EncryptSecret } from './EncryptSecret'
import { CreateLink } from './CreateLink'
import { useRendezvousTunnel } from '../rendezvous'

const rendezvousUrlGlobal = process.env.NEXT_PUBLIC_HUSH_HUSH_RENDEZVOUS_URL

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
  const rendezvousTunnel = useRef(undefined)
  const [rendezvousUrl, setRendezvousUrl] = useState('')
  const [workflow, setWorkflow] = useState(Stages.Connect)
  const [did, setDid] = useState(undefined)
  const [currentDid, setCurrentDid] = useState(undefined)
  const [secret, setSecret] = useState(undefined)
  const [publicEncryptionKey, setPublicEncryptionKey] = useState(undefined)
  const [cid, setCID] = useState(undefined)
  const [closeDialog, setCloseDialog] = useState(false)

  const onReady = useCallback(() => {
    console.log('Tunnel to IdApp established')
    setCloseDialog(true)
    setWorkflow(Stages.Recipient)
  }, [])

  const onCreated = useCallback(({ rendezvousTunnel: rt, rendezvousTunnelUrl: rendezvousUrl }) => {
    console.log('Tunnel to IdApp created')
    rendezvousTunnel.current = rt
    setRendezvousUrl(rendezvousUrl)
  }, [])

  useRendezvousTunnel({
    url: rendezvousUrlGlobal,
    onCreated,
    onReady
  })

  const onRecipientReady = useCallback(async ({ did, currentDid }) => {
    console.log('got your recipient DID:', did)
    console.log('and your current DID:', currentDid)
    setDid(did)
    setCurrentDid(currentDid)
    setWorkflow(Stages.Secret)
  }, [])

  const onSecretReady = useCallback(async ({ secret }) => {
    console.log('got your secret:', secret)
    setSecret(secret)
    setWorkflow(Stages.RecipientDIDDocument)
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
      <IdAppConnect rendezvousUrl={rendezvousUrl} closeDialog={closeDialog} />
    )
  }

  const renderRecipient = () => {
    return (
      <Recipient onRecipientReady={onRecipientReady} rendezvousTunnel={rendezvousTunnel.current} />
    )
  }

  const renderEnterSecret = () => {
    return (
      <EnterSecret
        did={did}
        onSecretReady={onSecretReady}
      />
    )
  }

  const renderRecipientDIDDocument = () => {
    return (
      <FetchDidDocument
        onDIDDocumentRetrieved={onDIDDocumentRetrieved}
        did={did}
        baseUrl={rendezvousUrlGlobal}
      />
    )
  }

  const renderEncryptSecret = () => {
    return (
      <EncryptSecret
        onEncryptedCIDRetrieved={onEncryptedCIDRetrieved}
        encryptionKey={publicEncryptionKey}
        secret={secret}
        idappRendezvousTunnel={rendezvousTunnel.current}
        baseUrl={rendezvousUrlGlobal}
      />
    )
  }

  const renderCreateLink = () => {
    return (
      <CreateLink cid={cid} did={did} currentDid={currentDid} />
    )
  }

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
