import React from 'react'
import { graphql } from 'gatsby'
import Helmet from 'react-helmet'

import { Header } from 'src/components/header'
import { IntroPanel } from 'src/components/intro-panel'
import { Box1 } from 'src/content'

import { BodyFrame } from 'src/components/ui-blocks'

import { useLogin } from 'src/hooks'

const Home = ({ data, location }) => {
  const loggedIn = useLogin(location)

  if (!loggedIn) {
    return null
  }

  return (
    <>
      <Helmet title='Identity Box'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0' />
        <link href='https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap' rel='stylesheet' />
      </Helmet>
      <Header />
      <BodyFrame>
        <IntroPanel data={data} />
        <Box1 data={data} />
      </BodyFrame>
    </>
  )
}

export const query = graphql`
  query {
    allFile(filter: {relativeDirectory: {glob: "**/homepage/src/images"}}) {
      edges {
        node {
          publicURL
          name
        }
      }
    }
  }
`

export default Home
