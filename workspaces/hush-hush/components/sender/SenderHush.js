import React, { useState, useCallback } from 'react'
import { Recipient } from './Recipient'

const Stages = Object.freeze({
  Recipient: Symbol('gettingRecipient'),
  Invite: Symbol('inviteRecipient'),
  Inviting: Symbol('invitingProgress'),
  Pending: Symbol('invitationPending'),
  Secret: Symbol('gettingSecret'),
  RecipientKey: Symbol('checkingIfRecipientKeyIsInTheBin'),
  Hush: Symbol('hushing')
})

const SenderHush = () => {
  const [workflow] = useState(Stages.Recipient)

  const onRecipientReady = useCallback(async (recipient, telepathChannel) => {
    console.log('got your recipient DID:', recipient)
  }, [])

  const renderRecipient = () => {
    return (
      <Recipient onSubmit={onRecipientReady} />
    )
  }

  switch (workflow) {
    case Stages.Recipient:
      return renderRecipient()
    default:
      return null
  }
}

export { SenderHush }
