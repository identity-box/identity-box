import React from 'react'
import Head from 'next/head'
import { Global } from '@emotion/core'
import App, { Container } from 'next/app'
import 'semantic-ui-css/semantic.min.css'

export default class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props

    return (
      <Container>
        <Head>
          <title>Hush Hush</title>
          <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no' />
          <link href='https://fonts.googleapis.com/css?family=Roboto+Mono' rel='stylesheet' />
        </Head>
        <Global styles={{
          'html,body': {
            backgroundColor: 'black',
            margin: 0,
            padding: 0
          }
        }}
        />
        <Component {...pageProps} />
      </Container>
    )
  }
}
