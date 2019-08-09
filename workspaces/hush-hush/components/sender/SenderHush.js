import React from 'react'
import base64url from 'base64url'
import { Recipient } from './Recipient'
import { CogitoGarbageBin } from '../cogito-garbage-bin'

const Stages = Object.freeze({
  Recipient: Symbol('gettingRecipient'),
  Invite: Symbol('inviteRecipient'),
  Inviting: Symbol('invitingProgress'),
  Pending: Symbol('invitationPending'),
  Secret: Symbol('gettingSecret'),
  RecipientKey: Symbol('checkingIfRecipientKeyIsInTheBin'),
  Hush: Symbol('hushing')
})

class SenderHush extends React.Component {
  state = {
    workflow: Stages.Recipient
  }

  knownRecipient = async (recipient, telepathChannel) => {
    try {
      const garbageBin = new CogitoGarbageBin({ telepathChannel })
      const tag = await garbageBin.get({
        key: base64url.encode(recipient)
      })
      if (!tag || tag.length === 0) {
        return undefined
      }
      return tag
    } catch (e) {
      console.error(e)
      return undefined
    }
  }

  onRecipientReady = async (recipient, telepathChannel) => {
    console.log('got your recipient:', recipient)
    const senderTag = await this.knownRecipient(recipient, telepathChannel)
    console.log('tag [iOS]:', senderTag)
    if (senderTag) {
      const { epub: recipientEncryptedPublicKey, tag: recipientTag } = await read(senderTag)
      if (recipientEncryptedPublicKey && recipientTag) {
        this.setState({ workflow: Stages.Secret, recipient, telepathChannel, senderTag, recipientEncryptedPublicKey, recipientTag })
      } else {
        console.log('recipient=', recipient)
        this.setState({ workflow: Stages.Pending, recipient })
      }
    } else {
      this.setState({ workflow: Stages.Invite, recipient, telepathChannel })
    }
  }

  onDone = () => {
    this.setState({
      workflow: Stages.Recipient,
      secret: undefined,
      recipient: undefined,
      telepathChannel: undefined,
      senderTag: undefined,
      recipientEncryptedPublicKey: undefined,
      recipientTag: undefined
    })
  }

  renderRecipient = () => {
    return (
      <Recipient onSubmit={this.onRecipientReady} />
    )
  }

  render () {
    switch (this.state.workflow) {
      case Stages.Recipient:
        return this.renderRecipient()
      default:
        return null
    }
  }
}

export { SenderHush }
