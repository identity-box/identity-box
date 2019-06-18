import React from 'react'
import { Box, Row } from 'src/components/ui-blocks'

import { Box1Content1 } from './Box1Content1'
import { Box1Content2 } from './Box1Content2'

const Box1 = ({ data }) => (
  <Box>
    <Row>
      <Box1Content1 data={data} />
    </Row>
    <Row>
      <Box1Content2 data={data} />
    </Row>
  </Box>
)

export { Box1 }
