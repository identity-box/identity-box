import styled from '@emotion/styled'
import { TextBox } from 'src/components/ui-blocks'

const EnterIdBoxWrapper = styled.div({
  display: 'flex',
  flexFlow: 'column'
})

const H1 = styled.h1({
  display: 'inline-block',
  margin: '0 0 20px 0',
  padding: 0,
  fontFamily: 'Roboto Mono, monospace',
  fontSize: '36pt',
  color: 'white',
  width: 'max-content',
  '@media (max-width: 568px)': {
    fontSize: '22pt',
    width: '100%'
  },
  fontWeight: '200'
})

const H3 = styled.h3({
  flexGrow: 1,
  width: 0,
  margin: 0,
  padding: 0,
  fontFamily: 'Roboto Mono, monospace',
  fontSize: '16pt',
  lineHeight: '1.5em',
  '@media (max-width: 568px)': {
    fontSize: '12pt',
    lineHeight: '1.2em'
  },
  color: 'white',
  fontWeight: '200',
  marginBottom: '50px'
})

const Box3Content1 = () => (
  <EnterIdBoxWrapper>
    <H1>Enter Identity Box</H1>
    <div css={{
      display: 'flex'
    }}
    >
      <H3>and start building the decentralized web of the future today</H3>
    </div>
    <div css={{
      display: 'flex'
    }}
    >
      <TextBox css={{
        width: 0,
        '@media (max-width: 1100px)': {
          width: 0
        },
        flexGrow: 1
      }}
      >
        Identity Box is your personal P2P networking node giving you
        access to the global network of distributed storage, digital
        identity, and even more in the future.
      </TextBox>
    </div>

  </EnterIdBoxWrapper>
)

export { Box3Content1 }
