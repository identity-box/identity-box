import React from 'react'
import Head from 'next/head'
import { Global } from '@emotion/core'
import App, { Container } from 'next/app'
import 'semantic-ui-css/semantic.min.css'

export default class MyApp extends App {
  static async getInitialProps ({ Component, router, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

  render () {
    const { Component, pageProps } = this.props

    return (
      <Container>
        <Head>
          <title>monorepo-nextjs-example</title>
          <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no' />
        </Head>
        <Global styles={{ 'html,body': {
          backgroundColor: 'white',
          margin: 0,
          padding: 0
        } }} />
        <Component {...pageProps} />
      </Container>
    )
  }
}
