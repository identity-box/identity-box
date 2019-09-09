import React from 'react'
import styled from '@emotion/styled'
import { Link } from 'src/components/forms'

const Wrapper = styled.div({
  display: 'flex'
})

const Buttons = () => (
  <Wrapper>
    <Link to='/identity-box'>Learn more</Link>
    <Link
      css={{
        marginLeft: '50px'
      }} to='/experience-identity-box'
    >Early Access Program
    </Link>
  </Wrapper>
)

export { Buttons }
