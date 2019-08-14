import React, { useState, useCallback } from 'react'
import { IdAppConnect } from './IdAppConnect'
import { Recipient } from './Recipient'
import { EnterSecret } from './EnterSecret'

const Stages = Object.freeze({
  Connect: Symbol('connecting'),
  Recipient: Symbol('gettingRecipient'),
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

  const onRecipientReady = useCallback(async ({ did }) => {
    console.log('got your recipient DID:', did)
    setDid(did)
    setWorkflow(Stages.Secret)
  }, [telepathChannel])

  const onSecretReady = useCallback(async ({ secret }) => {
    console.log('got your secret:', secret, did)
  }, [did])

  const onConnected = useCallback(telepathChannel => {
    console.log('Connected to IdApp')
    setTelepathChannel(telepathChannel)
    setWorkflow(Stages.Recipient)
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

  switch (workflow) {
    case Stages.Connect:
      return renderConnect()
    case Stages.Recipient:
      return renderRecipient()
    case Stages.Secret:
      return renderEnterSecret()
    default:
      return null
  }
}

export { SenderHush }
