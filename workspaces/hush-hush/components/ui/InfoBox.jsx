const InfoBox = ({ children, marginTop = 0, marginBottom = 0, color = 'white' }) => {
  return (
    <div style={{
      textAlign: 'center',
      marginTop,
      marginBottom,
      color
    }}
    >{children}
    </div>
  )
}

export { InfoBox }
