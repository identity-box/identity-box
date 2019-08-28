import React, { useState, useEffect } from 'react'

import { NoSecret } from './NoSecret'
import { ProcessSecret } from './ProcessSecret'

const RecipientHush = () => {
  const [senderTagBase64, setSenderTagBase64] = useState(undefined)

  useEffect(() => {
    if (window.location.hash) {
      const senderTagBase64 = window.location.hash.substring(1)
      console.log('senderTagBase64=', senderTagBase64)
      setSenderTagBase64(senderTagBase64)
    }
  }, [])

  if (senderTagBase64) {
    return (
      <ProcessSecret senderTagBase64={senderTagBase64} />
    )
  } else {
    return (
      <NoSecret />
    )
  }
}

export { RecipientHush }
