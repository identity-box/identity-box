import React from 'react'
import styled from '@emotion/styled'
import { Link, ExternalLink } from 'src/components/forms'

const Wrapper = styled.div({
  display: 'flex'
})

const Buttons = () => (
  <Wrapper>
    <Link to='/developers/contributing'>Learn more</Link>
    <ExternalLink css={{
      marginLeft: '50px'
    }} href='https://youtu.be/aqAUmgE3WyM' target='_blank'>Watch demo</ExternalLink>
  </Wrapper>
)

export { Buttons }
