import styled from '@emotion/styled'
import { css } from '@emotion/css'
import { Link } from 'src/components/forms'

const Wrapper = styled.div({
  display: 'flex'
})

const Buttons = () => (
  <Wrapper>
    <Link to='/identity-box'>Learn more</Link>
    <Link
      className={css({
        marginLeft: '50px'
      })}
      to='/experience-identity-box'
    >
      Early Access Program
    </Link>
  </Wrapper>
)

export { Buttons }
