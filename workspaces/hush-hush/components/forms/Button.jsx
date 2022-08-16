const Button = ({ children, disabled, ...rest }) => (
  <input {...rest} style={{
    fontFamily: '"Roboto Mono", monospace',
    fontSize: '0.8em',
    backgroundColor: 'transparent',
    color: disabled ? 'grey' : 'white',
    alignSelf: 'center',
    marginTop: '20px',
    borderRadius: '10px',
    borderColor: 'white',
    outline: 0,
    opacity: '1.0',
    boxShadow: 'none',
    padding: '15px',
    border: '1px solid white',
    transition: 'all 0.2s ease-in-out 0s',
    '&:active': {
      opacity: '1.0',
      borderWidth: '3px',
      borderColor: 'white',
      border: '1px solid #dddddd'
    },
    '&:hover': {
      filter: disabled ? 'none' : 'brightness(85%)'
    }
  }}>
    {children}
  </input>
)

export { Button }
