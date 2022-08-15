import { FadingValueBox } from '../animations'
import { Red, InfoBox, Centered } from '../ui'

const errorMessages = {
  'NO-MATCHING-IDENTITY-FOUND': 'We look through all your identities on your mobile but could not find any that matches the intended DID. ' +
                                'Maybe contact the sender of the secret and check if a correct identity has been used.'
}

const PresentError = ({ errorID }) => {
  return (
    <FadingValueBox>
      <Centered>
        <InfoBox><Red>Error decrypting secret...</Red></InfoBox>
        <InfoBox marginTop='15px'>{errorMessages[errorID] || 'Ups... Unknown error. Please contact us.'}</InfoBox>
      </Centered>
    </FadingValueBox>
  )
}

export { PresentError }
