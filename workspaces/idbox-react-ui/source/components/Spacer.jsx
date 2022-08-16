export const Spacer = ({ children, render, margin = 0, padding = 0 }) => {
  return (
    <div style={{
      margin,
      padding,
      boxSizing: 'border-box'
    }}
    >
      {render ? render() : children}
    </div>
  )
}
