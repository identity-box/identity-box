import { useEffect } from 'react'

import { FadingValueBox } from '../animations'
import { Green, InfoBox, Centered } from '../ui'

const Start = ({ next }) => {
  useEffect(() => {
    setTimeout(() => {
      next()
    }, 2000)
  }, [])
  return (
    <FadingValueBox>
      <Centered>
        <InfoBox>Your link looks <Green>good</Green>.</InfoBox>
      </Centered>
    </FadingValueBox>
  )
}

export { Start }
