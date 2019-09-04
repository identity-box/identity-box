import React, { useState, useEffect } from 'react'
import { Telepath } from '@identity-box/telepath'
import { IdAppConnector } from '@identity-box/idbox-react-ui'
import nacl from 'tweetnacl'
import base64url from 'base64url'

const Connector = ({
  onDone = () => {},
  title,
  disabled
}) => {
  const [open, setOpen] = useState(false)
  const [telepathChannel, setTelepathChannel] = useState(null)

  const getConnectUrl = () => {
    return telepathChannel.createConnectUrl('https://idbox.now.sh')
  }

  const createRandomId = () => {
    const idSize = 18
    const idBytes = nacl.randomBytes(idSize)
    return base64url.encode(idBytes)
  }

  const createRandomKey = () => {
    return nacl.randomBytes(nacl.secretbox.keyLength)
  }

  const createRandomClientId = () => {
    return base64url.encode(nacl.randomBytes(8))
  }

  const createChannel = async () => {
    const telepath = new Telepath({
      serviceUrl: process.env.serviceUrl[process.env.NODE_ENV]
    })
    const telepathChannel = await telepath.createChannel({
      id: createRandomId(),
      key: createRandomKey(),
      appName: 'Hush Hush',
      clientId: createRandomClientId()
    })
    await telepathChannel.connect()
    setTelepathChannel(telepathChannel)
  }

  useEffect(() => {
    createChannel()
  }, [])

  if (!telepathChannel) return null
  return (
    <div css={{ alignSelf: 'center' }}>
      <IdAppConnector
        open={open}
        telepathChannel={telepathChannel}
        buttonText={title}
        buttonDisabled={disabled}
        buttonStyling={{ primary: true }}
        connectUrl={getConnectUrl()}
        onOpen={() => setOpen(true)}
        onDone={() => {
          setOpen(false)
          onDone(telepathChannel)
        }}
        onCancel={() => setOpen(false)}
      />
    </div>
  )
}

export { Connector }
