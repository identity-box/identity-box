import React, { Component } from 'react'
import { FadingValueBox } from '../animations'

import { Form, Input, Label } from '../forms'
import { Connector } from '../identity'
import { Blue } from '../ui'

// From https://emailregex.com
const emailValidationRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

class RecipientOld extends Component {
  state = {
    recipient: '',
    validRecipient: false,
    transitioning: false
  }

  constructor () {
    super()
    this.recipientField = React.createRef()
  }

  onChange = event => {
    const recipient = event.target.value
    if (this.validRecipient(recipient)) {
      this.setState({ recipient, validRecipient: true })
    } else {
      this.setState({ recipient, validRecipient: false })
    }
  }

  onSubmit = event => {
    event.preventDefault()
  }

  onDone = (telepathChannel) => {
    this.setState({ transitioning: true })
    this.props.onSubmit && this.props.onSubmit(this.state.recipient, telepathChannel)
  }

  validRecipient = recipient => {
    return recipient.length > 0 &&
      recipient.match(emailValidationRegEx)
  }

  componentDidMount () {
    this.recipientField.current.focus()
  }

  render () {
    if (this.state.transitioning) {
      return (
        <FadingValueBox trigger={this.state.transitioning}>
          <div css={{ width: '100%', textAlign: 'center' }}>
            Checking invitation for <Blue>{this.state.recipient}</Blue>...
          </div>
        </FadingValueBox>
      )
    }
    return (
      <FadingValueBox>
        <Form onSubmit={this.onSubmit}>
          <Label htmlFor='frmEmailA'>Recipient:</Label>
          <Input id='frmEmailA' type='email'
            name='email'
            ref={this.recipientField}
            value={this.state.recipient}
            placeholder='name@example.com'
            required
            autocomplete='email'
            onChange={this.onChange}
            css={{ marginBottom: '1rem' }} />
          { this.state.validRecipient && <Connector onDone={this.onDone}
            title="Let's hush..."
            disabled={this.state.disabled} /> }
        </Form>
      </FadingValueBox>
    )
  }
}

export { RecipientOld }
