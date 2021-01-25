import Head from 'next/head'
import { Global } from '@emotion/react'

const AssociationApp = ({ Component, pageProps }) => (
  <>
    <Head>
      <title>Association</title>
      <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no' />
      <link href='https://fonts.googleapis.com/css?family=Roboto+Mono' rel='stylesheet' />
    </Head>
    <Global styles={{
      'html,body': {
        backgroundColor: 'white',
        margin: 0,
        padding: 0
      }
    }}
    />
    <Component {...pageProps} />
  </>
)

export default AssociationApp
