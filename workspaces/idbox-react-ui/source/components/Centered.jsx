export const Centered = ({ children }) => (
  <div style={{
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    {children}
  </div>
)
