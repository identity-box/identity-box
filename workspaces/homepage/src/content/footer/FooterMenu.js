import React from 'react'
import styled from '@emotion/styled'

const Li = styled.li({
  listStyleType: 'none',
  margin: '10px 0',
  '@media (max-width: 568px)': {
    margin: '5px 0'
  },
  padding: 0
})

const Items = styled.ul({
  margin: '0 0 5px 0'
})

const FooterMenu = ({ title, children, ...props }) => (
  <div
    css={{
      display: 'flex',
      flexFlow: 'column',
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '10pt'
    }} {...props}
  >
    <h3 css={{
      margin: 0,
      color: 'white',
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '10pt',
      fontWeight: 400
    }}
    >{title}
    </h3>
    <Items>
      {React.Children.map(children, child => (
        <Li>{child}</Li>
      ))}
    </Items>
  </div>
)

export { FooterMenu }
