const Button = ({ children, disabled, ...rest }) => (
  <input className={`font-roboto-mono text-xs bg-transparent self-center mt-5 p-4 rounded-lg border-white border-solid border transition-all duration-200 ease-in-out outline-0 shadow-none active:border-[3px] active:border-[#dddddd] ${disabled ? 'text-gray-500 hover:filter-none' : 'text-white hover:brightness-[85%]'}`} {...rest}>
    {children}
  </input>
)

export { Button }
