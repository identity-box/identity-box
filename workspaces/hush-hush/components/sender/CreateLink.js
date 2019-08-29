import React, { useState, useRef, useEffect } from 'react'
import { Button } from 'semantic-ui-react'
import base64url from 'base64url'
import { FadingValueBox } from '../animations'
import { Textarea } from '../forms'
import { Green, InfoBox, Centered, MrSpacer } from '../ui'

const CreateLink = ({ cid, did, currentDid }) => {
  const [copied, setCopied] = useState(false)
  const secretField = useRef(undefined)
  const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001'
    : 'https://idbox.now.sh'
  const link = `${baseUrl}/hush-hush/secret#${base64url.encode(`${cid}.${did}.${currentDid}`)}`

  const isOS = () => {
    return navigator.userAgent.match(/ipad|iphone/i)
  }

  const clearSelection = () => {
    if (window.getSelection) {
      if (window.getSelection().empty) { // Chrome
        window.getSelection().empty()
      } else if (window.getSelection().removeAllRanges) { // Firefox
        window.getSelection().removeAllRanges()
      }
    } else if (document.selection) { // IE?
      document.selection.empty()
    }
  }

  const selectText = textarea => {
    let range
    let selection
    if (isOS()) {
      range = document.createRange()
      range.selectNodeContents(textarea)
      selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      textarea.setSelectionRange(0, 999999)
    } else {
      textarea.select()
    }
  }

  const onCopy = () => {
    const textarea = document.querySelector('#secret-link')
    selectText(textarea)
    document.execCommand('copy')
    clearSelection()
    setCopied(true)
  }

  const setHeight = () => {
    const area = secretField.current
    area.style.height = `${Number.parseInt(area.scrollHeight, 10) + 10}px`
  }

  useEffect(() => {
    setHeight()
  }, [])

  return (
    <FadingValueBox>
      <Centered>
        <InfoBox marginBottom='20px'>Your secret is <Green>ready</Green> to be shared with your hush budy.</InfoBox>
        <InfoBox marginBottom='20px'>Copy it, paste to your favorite email client and send it to the recipient.</InfoBox>
        <InfoBox marginBottom='30px'>
          BTW: you can share this link anyway you like. <Green>It is safe. </Green>
          Only your intended hush budy will be able to decrypt the secret.
          And that's gorgeous. Isn't it?
        </InfoBox>
        <Textarea id='secret-link' ref={secretField} css={{ height: 'auto' }} readOnly value={link} />
        <MrSpacer space='30px' />
        <Button primary onClick={onCopy}>{copied ? 'Copied' : 'Copy to clipboard...'}</Button>
      </Centered>
    </FadingValueBox>
  )
}

export { CreateLink }
