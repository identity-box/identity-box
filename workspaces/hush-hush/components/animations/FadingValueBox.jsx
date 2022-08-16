import { AnimationBox } from './AnimationBox'

const FadingValueWrapper = ({ children, opacity, duration }) => {
  const style = {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%'
  }
  if (opacity === 0) {
    style.opacity = 0
  } else {
    style.opacity = opacity
    style.transition = `opacity ${duration}s ease-in-out 0s`
  }
  return (
    <div style={style}>
      {children}
    </div>
  )
}

const FadingValueBox = ({ trigger, children, duration = 1 }) => (
  <AnimationBox
    startValue={0}
    stopValue={1}
    key={trigger}
  >
    {
      opacity =>
        <FadingValueWrapper duration={duration} opacity={opacity}>
          {children}
        </FadingValueWrapper>
    }
  </AnimationBox>
)

export { FadingValueBox }
