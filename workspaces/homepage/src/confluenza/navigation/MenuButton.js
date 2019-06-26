// import React, { useState, useEffect } from 'react'
import styled from '@emotion/styled'

const MenuButton = styled.button(({ backgroundImage }) => ({
  width: '48px',
  height: '48px',
  backgroundColor: 'white',
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'auto 100%',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  margin: 0,
  borderRadius: '10px',
  outline: 0,
  boxShadow: 'none',
  // border: '1px solid #F486CA',
  borderWidth: 0,
  transition: 'all 0.2s ease-in-out 0s',
  '@media (hover)': {
    '&:hover': {
      backgroundColor: '#F486CA'
    }
  },
  cursor: 'pointer'
}))
// const MenuInput = styled.input(({ backgroundImage, backgroundColor }) => ({
//   width: '48px',
//   height: '48px',
//   backgroundColor,
//   backgroundImage,
//   backgroundSize: 'auto 100%',
//   backgroundPosition: 'center center',
//   backgroundRepeat: 'no-repeat',
//   margin: 0,
//   borderRadius: '10px',
//   outline: 0,
//   boxShadow: 'none',
//   // border: '1px solid #F486CA',
//   borderWidth: 0,
//   transition: 'all 0.2s ease-in-out 0s',
//   '&:hover': {
//     backgroundColor: '#F486CA'
//   },
//   cursor: 'pointer'
// }))

// const MenuButton = ({ onClick, reset, backgroundImage, ...props }) => {
//   const [ backgroundColor, setBackgroundColor ] = useState('white')

//   const onClickHandler = () => {
//     if (backgroundColor === 'white') {
//       setBackgroundColor('#F486CA')
//     } else {
//       setBackgroundColor('white')
//     }
//     onClick()
//   }

//   useEffect(() => {
//     setBackgroundColor('white')
//   }, [reset])

//   return (
//     <MenuInput onClick={onClickHandler} backgroundImage={`url(${backgroundImage})`} backgroundColor={backgroundColor} {...props} />
//   )
// }

export { MenuButton }
