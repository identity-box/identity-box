import { Header } from 'semantic-ui-react'
import { Centered } from '../components/Centered'
import { Spacer } from '../components/Spacer'
import { IdAppQRCode } from '../IdAppQRCode'

const ConnectorBody = ({ rendezvousUrl }) => {
  return (
    <Centered>
      <Header>Please scan the QR code below with your mobile device.</Header>
      <Spacer
        margin='20px 0 50px 0'
        render={() => <IdAppQRCode key={rendezvousUrl} connectUrl={rendezvousUrl} />}
      />
    </Centered>
  )
}
export { ConnectorBody }
