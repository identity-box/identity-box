import styled from '@emotion/native'
import type { ColorValue, DimensionValue } from 'react-native'

const MrFiller = styled.View(
  ({ height, color }: { height: DimensionValue; color: ColorValue }) => ({
    width: '100%',
    height,
    backgroundColor: color
  })
)

const MrSpacer = styled.View(({ space }: { space: DimensionValue }) => ({
  width: 1,
  height: space
}))

export { MrFiller, MrSpacer }
