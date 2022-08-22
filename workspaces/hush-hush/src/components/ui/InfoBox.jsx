import { twMerge } from 'tailwind-merge'

const InfoBox = ({ children, cls }) => {
  return (
    <p className={twMerge('text-center mt-[0px] mb-[0px] text-white', cls)}>
      {children}
    </p>
  )
}

export { InfoBox }
