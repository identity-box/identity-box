import { Button, Modal } from 'semantic-ui-react'
import { ConnectorBody } from './ConnectorBody'
import PropTypes from 'prop-types'

const IdAppConnector = ({
  rendezvousUrl,
  buttonStyling,
  buttonDisabled,
  buttonText,
  open,
  onOpen,
  onCancel
}) => {
  return (
    <Modal
      open={open}
      trigger={
        <Button
          {...buttonStyling}
          disabled={buttonDisabled}
          onClick={async () => {
            if (onOpen) {
              await onOpen()
            }
          }}
        >
          {buttonText || 'Show QR code'}
        </Button>
      }
      onClose={() => {
        if (onCancel) {
          onCancel()
        }
      }}
      closeIcon
    >
      <Modal.Header>Scan QRCode</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <ConnectorBody
            rendezvousUrl={rendezvousUrl}
          />
        </Modal.Description>
      </Modal.Content>
    </Modal>
  )
}

IdAppConnector.propTypes = {
  rendezvousUrl: PropTypes.string.isRequired,
  buttonStyling: PropTypes.object,
  buttonDisabled: PropTypes.bool,
  buttonText: PropTypes.string,
  open: PropTypes.bool,
  onOpen: PropTypes.func,
  onCancel: PropTypes.func
}

export { IdAppConnector }
