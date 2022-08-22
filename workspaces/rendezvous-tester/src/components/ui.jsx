import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { twMerge } from 'tailwind-merge'

export const Wrapper = ({ children }) => (
  <div className='flex flex-col p-7 min-w-[750px] max-w-[750px] overflow-auto h-screen'>
    {children}
  </div>
)

export const Row = ({ children, cls }) => (
  <div className={twMerge('flex w-full', cls)}>
    {children}
  </div>
)

export const ButtonLink = ({ children, onClick, onFocus, to, cls }) => {
  if (to) {
    return (
      <Link tabIndex='0' onFocus={onFocus} to={to}>
        <div className={twMerge('bg-transparent border-none cursor-pointer hover:underline my-0 p-0 text-red-900', cls)}>
          {children}
        </div>
      </Link>
    )
  } else {
    return (
      <button onClick={onClick} className={twMerge('bg-transparent border-none cursor-pointer hover:underline my-0 p-0 text-red-900', cls)}>
        {children}
      </button>
    )
  }
}

export const Input = ({ children, placeholder, type, value, onChange }) => {
  const inputEl = useRef(null)

  useEffect(() => {
    inputEl.current.focus()
  }, [])
  return (
    <input ref={inputEl} className='p-2 flex-[5_0_0] border border-solid border-black outline-none transition-[border-color] duration-200 ease-in-out focus:border-red-900' placeholder={placeholder} type={type} value={value} onChange={onChange}>
      {children}
    </input>
  )
}

export const Button = React.forwardRef(({ children, onClick, disabled }, ref) => (
  <button ref={ref} onClick={onClick} disabled={disabled} className='bg-black hover:bg-red-900 p-2 rounded text-white ml-5 flex-[1_0_0]'
  >
    {children}
  </button>
))

Button.displayName = 'Button'

export const Response = ({ children }) => (
  <p className='m-0 mt-2 p-5 max-w-[300px] text-2xl font-bold border border-solid border-black'>
    {children}
  </p>
)

export const ReceiverInput = ({ children, type, value, onChange }) => {
  const inputEl = useRef(null)

  useEffect(() => {
    inputEl.current.focus()
  }, [])

  return (
    <input ref={inputEl} className='flex-[5_0_0] text-base p-2 border border-solid border-black outline-none transition-[border-color] duration-200 ease-in-out focus:border-red-900' type={type} value={value} onChange={onChange}>
      {children}
    </input>
  )
}

export const Label = ({ children }) => (
  <label className='flex flex-col px-0 py-1 flex-[5_0_0]'>
    {children}
  </label>
)
