import React from 'react'
import { Row } from 'src/components/ui-blocks'

const Copyright = () => (
  <Row>
    <p css={{
      color: 'white',
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '10pt',
      margin: 0
    }}><span css={{
        fontSize: '14pt'
      }}>&copy;</span> 2019 Identity Box</p>
  </Row>
)

export { Copyright }
