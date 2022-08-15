import Head from 'next/head'
import { Global } from '@emotion/react'
import App from 'next/app'
import 'semantic-ui-css/semantic.min.css'

export default class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props

    return (
      <>
        <Head>
          <title>Hush Hush</title>
          <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no' />
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
      </>
    )
  }
}
