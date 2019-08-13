import React, { useState, useCallback } from 'react'
import { IdAppConnect } from './IdAppConnect'
import { Recipient } from './Recipient'

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

  const onRecipientReady = useCallback(async (recipient, telepathChannel) => {
    console.log('got your recipient DID:', recipient)
  }, [])

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

  switch (workflow) {
    case Stages.Connect:
      return renderConnect()
    case Stages.Recipient:
      return renderRecipient()
    default:
      return null
  }
}

export { SenderHush }
