import React from 'react'
// import styled from '@emotion/styled'
import { Link } from 'gatsby'

const NavigationLink = React.forwardRef((props, ref) => (
  <Link
    {...props} ref={ref} css={{
      display: 'inline-block',
      position: 'relative',
      left: '1rem',
      width: 'calc(100% - 1.5rem)',
      color: 'black',
      fontFamily: 'Roboto Mono, monospace',
      fontWeight: '300',
      fontSize: '0.8rem',
      lineHeight: '1.5rem',
      textDecoration: 'none',
      '&:hover': {
        color: 'black',
        textDecoration: 'none',
        '&:before': {
          visibility: 'visible',
          transform: 'scaleY(1)'
        }
      },
      '&:before': {
        backgroundColor: '#F486CA',
        content: "' '",
        position: 'absolute',
        width: '1px',
        height: '100%',
        top: 0,
        left: '-5px',
        visibility: 'hidden',
        transform: 'scaleY(0.3)',
        transition: 'all 0.3s ease-in-out 0s'
      },
      '&.active': {
        color: 'black',
        fontFamily: 'Roboto Mono, monospace',
        fontWeight: '500',
        fontSize: '0.8rem',
        transition: 'color 0.2s ease-in-out 0s'
      }
    }}
  >
    {props.children}
  </Link>
))

// const NavigationLink = styled(Link)(props => ({
//   display: 'inline-block',
//   position: 'relative',
//   left: '1rem',
//   width: 'calc(100% - 1.5rem)',
//   color: 'black',
//   fontFamily: 'Roboto Mono, monospace',
//   fontWeight: '300',
//   fontSize: '0.8rem',
//   textDecoration: 'none',
//   '&:hover': {
//     color: 'black',
//     textDecoration: 'none',
//     '&:before': {
//       visibility: 'visible',
//       transform: 'scaleY(1)'
//     }
//   },
//   '&:before': {
//     backgroundColor: '#F486CA',
//     content: "' '",
//     position: 'absolute',
//     width: '1px',
//     height: '100%',
//     top: 0,
//     left: '-5px',
//     visibility: 'hidden',
//     transform: 'scaleY(0.3)',
//     transition: 'all 0.3s ease-in-out 0s'
//   },
//   '&.active': {
//     color: 'black',
//     fontFamily: 'Roboto Mono, monospace',
//     fontWeight: '500',
//     fontSize: '0.8rem',
//     transition: 'color 0.2s ease-in-out 0s'
//   }
// }))

export { NavigationLink }
