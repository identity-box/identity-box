import { PageCentered } from '../components/ui'

import { SenderHush } from '../components/sender'

const Index = () => (
  <PageCentered>
    <div style={{ display: 'flex', flexFlow: 'column nowrap', alignItems: 'center', minHeight: '150px', maxWidth: '550px', width: '85%' }}>
      <SenderHush />
    </div>
  </PageCentered>
)

export default Index
