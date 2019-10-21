import styled from '@emotion/native'

const MrFiller = styled.View(({ height, color }) => ({
  width: '100%',
  height,
  backgroundColor: color
}))

const MrSpacer = styled.View(({ space }) => ({
  width: 1,
  height: space
}))

export { MrFiller, MrSpacer }
