import { PageCentered } from '../components/ui'
import { FadingValueBox } from '../components/animations'
import { RecipientHush } from '../components/recipient'

const Secret = () => (
  <PageCentered>
    <div style={{ display: 'flex', flexFlow: 'column nowrap', alignItems: 'center', minHeight: '150px', maxWidth: '550px', width: '85%' }}>
      <FadingValueBox>
        <RecipientHush />
      </FadingValueBox>
    </div>
  </PageCentered>
)

export default Secret
