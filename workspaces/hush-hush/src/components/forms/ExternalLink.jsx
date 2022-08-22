const ExternalLink = ({ children, disabled, ...rest }) => (
  <a {...rest} className={`font-roboto-mono text-xs bg-transparent mt-5 rounded-lg border border-white border-solid transition-all duration-200 ease-in-out hover:no-underline hover:border-[#D20DE7] hover:text-[#D20DE7] ${disabled ? 'text-gray-500 filter-none' : 'text-white brightness-[85%]'}`}>
    {children}
  </a>
)

export { ExternalLink }
