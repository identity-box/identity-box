import React from 'react'
import { twMerge } from 'tailwind-merge'

const Textarea = React.forwardRef(({ children, css, ...rest }, ref) => (
  <textarea rows={1} ref={ref} {...rest} className={twMerge('border whitespace-nowrap overflow-auto text-base border-solid border-black p-5 outline-none resize-none outline-0 transition-[border-color] duration-200 ease-in-out focus:border-red-900 selection:bg-gray-600', css)}>{children}</textarea>
))

Textarea.displayName = 'Textarea'

export { Textarea }
