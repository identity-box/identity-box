import styled from '@emotion/styled'
import { rhythm } from 'src/utils/typography'

const FixedNavigation = styled.div({
  display: 'block',
  position: 'fixed',
  top: 0,
  minWidth: '300px',
  maxWidth: '300px',
  height: `calc(100vh - ${rhythm(2)})`,
  // overflowY: 'auto',
  backgroundColor: '#F7F7F7'
  // WebkitOverflowScrolling: `touch`,
  // '::-webkit-scrollbar': {
  //   width: `6px`,
  //   height: `6px`
  // },
  // '::-webkit-scrollbar-thumb': {
  //   background: '#ccc'
  // }
})

export { FixedNavigation }
