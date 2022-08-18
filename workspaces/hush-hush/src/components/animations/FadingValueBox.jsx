import { AnimationBox } from './AnimationBox'

const FadingValueWrapper = ({ children, opacity, duration }) => {
  let extraStyles = 'opacity-0'
  if (opacity === 'max') {
    extraStyles = `opacity-100 transition-opacity ease-in-out ${duration}`
  }
  return (
    <div className={`flex flex-nowrap flex-col justify-center w-full ${extraStyles}`}>
      {children}
    </div>
  )
}

const FadingValueBox = ({ trigger, children, duration = 'duration-[1s]' }) => (
  <AnimationBox
    startValue='min'
    stopValue='max'
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
