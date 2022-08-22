import { PageCentered } from '../components/ui'
import { FadingValueBox } from '../components/animations'
import { RecipientHush } from '../components/recipient'

const Secret = () => (
  <PageCentered>
    <div className='flex flex-col flex-nowrap items-center min-h-[150px] max-w-[550px] w-5/6'>
      <FadingValueBox>
        <RecipientHush />
      </FadingValueBox>
    </div>
  </PageCentered>
)

export default Secret
