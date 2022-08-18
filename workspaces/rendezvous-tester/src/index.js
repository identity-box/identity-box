import React from 'react'
import { Global } from '@emotion/react'
import { createRoot } from 'react-dom/client';
import { HelmetProvider, Helmet } from 'react-helmet-async'
import { Router, Link } from '@reach/router'
import { App } from './rendezvous'
import { AppTunnelBrowser, AppTunnelMobile } from './rendezvous-tunnel'
import * as serviceWorker from './serviceWorker'
import { Buffer } from 'buffer'

window.Buffer = Buffer

const Home = () => (
  <div style={{
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    <p>What would you like to test?</p>
    <Link style={{ display: 'block', marginBottom: '20px' }} to='/rendezvous'>Rendezvous</Link>
    <Link style={{ display: 'block', marginBottom: '20px' }} to='/rendezvous-tunnel-browser'>Rendezvous Tunnel</Link>
  </div>
)

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <>
    <Global styles={{
      body: {
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }
    }}
    />
    <HelmetProvider>
      <Helmet>
        <title>Rendezvous</title>
      </Helmet>
      <Router>
        <Home path='/' />
        <App path='rendezvous' />
        <AppTunnelBrowser path='rendezvous-tunnel-browser' />
        <AppTunnelMobile path='rendezvous-tunnel-mobile' />
      </Router>
    </HelmetProvider>
  </>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
