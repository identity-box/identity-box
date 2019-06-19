import React from 'react'
import styled from '@emotion/styled'

const IntroPanel2 = styled.div({
  width: '100%',
  height: '100vh',
  minHeight: '700px',
  '@media (max-height: 560px)': {
    minHeight: '560px'
  },
  display: 'flex',
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'center'
})

const Title = styled.h1({
  margin: '40px',
  fontFamily: 'Roboto Mono, monospace',
  fontSize: '36pt',
  '@media (max-width: 568px)': {
    fontSize: '22pt'
  },
  fontWeight: '200',
  color: 'white',
  textAlign: 'center'
})

const Subtitle = styled.h2({
  margin: '60px',
  fontFamily: 'Roboto Mono, monospace',
  fontSize: '20pt',
  fontWeight: '200',
  lineHeight: '1.4',
  '@media (max-width: 568px)': {
    fontSize: '12pt',
    fontWeight: 300,
    margin: '30px'
  },
  color: 'white',
  textAlign: 'center'
})

const CubeImage = styled.div(({ imageUrl }) => ({
  width: '45%',
  paddingTop: '45%',
  '@media (min-width: 568px)': {
    width: '20%',
    paddingTop: '20%'
  },
  backgroundImage: `url(${imageUrl})`,
  backgroundSize: '100%',
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat'
}))

const IntroPanel = ({ data }) => (
  <IntroPanel2>
    <Title>Identity Box</Title>
    <CubeImage imageUrl={data.allFile.edges.filter(f => f.node.name === 'IdBoxMain')[0].node.publicURL} />
    <Subtitle>Decentralized Web of the Future</Subtitle>
  </IntroPanel2>
)

export { IntroPanel }
