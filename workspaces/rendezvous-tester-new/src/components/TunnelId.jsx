import { useRef, useEffect } from 'react'
import { Textarea } from './Textarea'
import { Row, Button } from './ui'

const TunnelId = ({ tunnelId }) => {
  const secretField = useRef(null)
  const buttonEl = useRef(null)

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
    secretField.current.focus()
    selectText(secretField.current)
    document.execCommand('copy')
    clearSelection()
    window.open('/rendezvous-tunnel-receiver', '_blank').focus()
  }

  const setHeight = () => {
    const area = secretField.current
    area.style.height = `${Number.parseInt(area.scrollHeight, 10) + 2}px`
  }

  useEffect(() => {
    setHeight()
    buttonEl.current.focus()
  }, [])

  return (
    <Row>
      <Textarea ref={secretField} css='flex-[5_0_0]' readOnly value={tunnelId} />
      <Button ref={buttonEl} onClick={onCopy}>Open Receiver</Button>
    </Row>
  )
}

export { TunnelId }
