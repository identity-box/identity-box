import { useState, useRef, useEffect } from 'react'
import { Button } from 'semantic-ui-react'
import { FadingValueBox } from '../animations'
import { Textarea } from '../forms'
import { Green, InfoBox, Centered, MrSpacer } from '../ui'

const PresentSecret = ({ secret }) => {
  const [copied, setCopied] = useState(false)
  const secretField = useRef(undefined)

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
        <InfoBox cls='mb-4'><Green>Secret</Green> successfully decrypted:</InfoBox>
        <Textarea id='secret-link' ref={secretField} css='h-auto' readOnly value={secret} />
        <MrSpacer space='30px' />
        <Button primary onClick={onCopy}>{copied ? 'Copied' : 'Copy to clipboard...'}</Button>
      </Centered>
    </FadingValueBox>
  )
}

export { PresentSecret }
