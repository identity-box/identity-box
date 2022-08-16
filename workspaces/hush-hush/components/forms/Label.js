const Label = ({ children, ...rest }) => (
  <label {...rest} style={{
    fontFamily: '"Roboto Mono", monospace',
    fontSize: '1.0rem',
    marginBottom: '10px',
    opacity: '0.5'
  }}>
    {children}
  </label>
)

export { Label }
