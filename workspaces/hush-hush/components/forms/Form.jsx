const Form = ({ children }) => (
  <form style={{
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%'
  }}>
    {children}
  </form>
)

export { Form }
