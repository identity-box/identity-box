import styled from '@emotion/styled'

const FooterRow = styled.div({
  width: '90%',
  maxWidth: '1000px',
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  '@media (max-width: 568px)': {
    justifyContent: 'space-between'
  },
  alignItems: 'center',
  marginBottom: '30px'
})

export { FooterRow }
