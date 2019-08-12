import React, { useState, useEffect } from 'react'
import { Telepath } from '@identity-box/telepath'
import { IdAppConnector } from '@identity-box/idbox-react-ui'

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

  const createChannel = async () => {
    const telepath = new Telepath({
      serviceUrl: 'https://idbox-queue.now.sh'
    })
    const telepathChannel = await telepath.createChannel({ appName: 'Hush Hush' })
    setTelepathChannel(telepathChannel)
  }

  useEffect(() => {
    createChannel()
  }, [])

  if (!telepathChannel) return null
  return (
    <div css={{ alignSelf: 'center' }}>
      <IdAppConnector open={open}
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
        onCancel={() => setOpen(false)} />
    </div>
  )
}

export { Connector }
