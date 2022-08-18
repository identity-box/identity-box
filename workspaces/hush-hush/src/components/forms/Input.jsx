const Input = ({ children, ...rest }) => (
  <input {...rest} className='font-roboto-mono text-xs w-full bg-black text-white border rounded-2xl border-solid border-white p-5 resize-none outline-0 transition-[border-color] duration-200 ease-in-out focus:border-[#0099FF] selection:bg-white'>
    {children}
  </input>
)

export { Input }
