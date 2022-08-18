const Label = ({ children, ...rest }) => (
  <label {...rest} className='font-roboto-mono text-base mb-2 opacity-50'>
    {children}
  </label>
)

export { Label }
