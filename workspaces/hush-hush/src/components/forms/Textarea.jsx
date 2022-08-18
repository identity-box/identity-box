import React from 'react'
import { twMerge } from 'tailwind-merge'

const Textarea = React.forwardRef(({ children, css, ...rest }, ref) => (
  <textarea ref={ref} {...rest} className={twMerge('font-roboto-mono w-full h-[300px] bg-black text-white border rounded-2xl border-solid border-white p-5 resize-none outline-0 transition-[border-color] duration-200 ease-in-out focus:border-[#0099FF] selection:bg-white', css)}>
    {children}
  </textarea>
))

Textarea.displayName = 'Textarea'

export { Textarea }
