import { useState } from 'react'
import { IdAppConnector } from '@identity-box/idbox-react-ui'

const Connector = ({
  closeDialog,
  title,
  rendezvousUrl,
  disabled
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ alignSelf: 'center' }}>
      <IdAppConnector
        open={open && closeDialog !== true}
        buttonText={title}
        buttonDisabled={disabled}
        buttonStyling={{ primary: true }}
        rendezvousUrl={rendezvousUrl}
        onOpen={() => setOpen(true)}
        onCancel={() => setOpen(false)}
      />
    </div>
  )
}

export { Connector }
