import { FadingValueBox } from '../animations'
import { Blue, InfoBox, MrSpacer, Centered } from '../ui'

import { Connector } from '../identity'

const IdAppConnect = ({ closeDialog, rendezvousUrl } = {}) => {
  return (
    <FadingValueBox>
      <Centered>
        <InfoBox cls='text-blue'>In order to share your secret securely with the intendent (and only intended) recipient, Hush Hush needs to know two things:</InfoBox>
        <InfoBox cls='mt-[15px]'>1. The DID of the intended recipient.</InfoBox>
        <InfoBox cls='mt-[15px]'>2. Your current DID.</InfoBox>
        <InfoBox cls='mt-[20px]'>
          For this reason, Hush Hush, needs to connect to your mobile where you can then
          select the intended recipient from your <Blue>Identity Box IdApp Address Book</Blue>.
        </InfoBox>
        <MrSpacer space='20px' />
        <InfoBox>
          Please make sure that you have your <Blue>IdApp</Blue> ready and that you have selected the identity you want to use before
          hitting <Blue>connect</Blue> below.
        </InfoBox>
        <MrSpacer space='50px' />
        <Connector
          title='Connect...'
          rendezvousUrl={rendezvousUrl}
          closeDialog={closeDialog}
        />
      </Centered>
    </FadingValueBox>
  )
}

export { IdAppConnect }
