import React from 'react'
import styled from '@emotion/styled'
import { AnimationBox } from './AnimationBox'

const FadingValueWrapper = styled.div(props => {
  const style = {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%'
  }
  if (props.opacity === 0) {
    return {
      ...style,
      opacity: 0
    }
  } else {
    return {
      ...style,
      opacity: props.opacity,
      transition: `opacity ${props.duration}s ease-in-out 0s`
    }
  }
})

const FadingValueBox = ({ trigger, children, duration = 1 }) => (
  <AnimationBox
    startValue={0}
    stopValue={1}
    key={trigger}
  >
    {
      opacity =>
        <FadingValueWrapper duration={duration} opacity={opacity}>
          {children}
        </FadingValueWrapper>
    }
  </AnimationBox>
)

export { FadingValueBox }
