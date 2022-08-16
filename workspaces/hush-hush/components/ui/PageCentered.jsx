export const PageCentered = ({ children }) => (
  <div style={{
    display: 'flex',
    flexFlow: 'row nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw'
  }}>
    {children}
  </div>
)
