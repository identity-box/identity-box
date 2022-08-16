export const Centered = ({ children }) => (
  <div style={{
    display: 'flex',
    width: '100%',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    {children}
  </div>
)
