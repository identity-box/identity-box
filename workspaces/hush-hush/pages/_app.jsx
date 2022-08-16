import 'semantic-ui-css/semantic.min.css'
import '../styles.css'
import Head from 'next/head'
import App from 'next/app'

export default class MyApp extends App {
  render () {
    const { Component, pageProps } = this.props

    return (
      <>
        <Head>
          <title>Hush Hush</title>
          <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no' />
        </Head>
        <Component {...pageProps} />
      </>
    )
  }
}
