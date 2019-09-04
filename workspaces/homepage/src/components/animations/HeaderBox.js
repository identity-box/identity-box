import React from 'react'
import styled from '@emotion/styled'
import { AnimationBox } from './AnimationBox'

const Wrapper = styled.div(props => ({
  display: 'flex',
  flexFlow: 'column nowrap',
  alignItems: 'flex-end',
  justifyContent: 'center',
  color: props.color || 'black'
}))

const Decor = styled.div(props => {
  if (props.width === 0) {
    return {
      width: 0,
      borderTop: `1px solid ${props.color || 'black'}`
    }
  } else {
    return {
      width: props.width,
      borderTop: `1px solid ${props.color || 'black'}`,
      transition: 'width 1s ease-in-out 0s'
    }
  }
})

const HeaderBox = ({ trigger, color, children }) => (
  <AnimationBox
    startValue={0}
    stopValue='100%'
    key={trigger}
  >
    {
      width =>
        <Wrapper>
          <Wrapper color={color}>
            {children}
            <Decor color={color} width={width} />
          </Wrapper>
        </Wrapper>
    }
  </AnimationBox>
)

export { HeaderBox }
