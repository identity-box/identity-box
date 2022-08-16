import { AnimationBox } from './AnimationBox'

const Wrapper = ({ children, color }) => (
  <div style={{
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'flex-end',
    justifyContent: 'center',
    color: color || 'black'
  }}>
    {children}
  </div>
)

const Decor = ({ children, color, width }) => {
  let style = {
    width,
    borderTop: `1px solid ${color || 'black'}`,
    transition: 'width 1s ease-in-out 0s'
  }
  if (width === 0) {
    style = {
      width: 0,
      borderTop: `1px solid ${color || 'black'}`
    }
  }
  return (
    <div style={style}>
      {children}
    </div>
  )
}

const HeaderBox = ({ trigger, color, children }) => (
  <AnimationBox
    startValue={0}
    stopValue='100%'
    key={trigger}
  >
    {
      width =>
        <Wrapper>
          <Wrapper color={color}>
            {children}
            <Decor color={color} width={width} />
          </Wrapper>
        </Wrapper>
    }
  </AnimationBox>
)

export { HeaderBox }
