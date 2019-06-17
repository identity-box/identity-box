import React from 'react'
import { Box, Row } from 'src/components/ui-blocks'

import { BoxContent1 } from './BoxContent1'
import { BoxContent2 } from './BoxContent2'

const Box1 = ({ data }) => (
  <Box>
    <Row>
      <BoxContent1 data={data} />
    </Row>
    <Row>
      <BoxContent2 data={data} />
    </Row>
  </Box>
)

export { Box1 }
