import React, { useState, useEffect } from 'react'
import { rhythm } from 'src/utils/typography'

import { Navigation } from 'src/confluenza/navigation'
import { MenuButton } from 'src/confluenza/navigation/MenuButton'
import { SiteTitle } from './SiteTitle'

const MobileNavigation = ({ menuActive, title, docs, location, onStateChanged, deltas }) => {
  return (
    <div css={{
      position: 'fixed',
      zIndex: 20,
      height: `calc(100vh - ${rhythm(3)})`,
      minWidth: '300px',
      maxWidth: '300px',
      '@media (max-width: 568px)': {
        minWidth: '100vw',
        maxWidth: '100vw',
        height: '100vh'
      },
      backgroundColor: 'rgba(247, 247, 247, 0.9)',
      WebkitOverflowScrolling: `touch`,
      '::-webkit-scrollbar': {
        width: `6px`,
        height: `6px`
      },
      '::-webkit-scrollbar-thumb': {
        background: '#ccc'
      },
      top: 0,
      right: '100vw',
      // height: '100vh',
      display: 'block',
      // justifyContent: 'center',
      // alignItems: 'center',
      // background: 'white',
      transition: 'transform 0.2s ease-in-out 0s',
      transform: menuActive ? 'translate(100%, 0)' : 'none'
    }}>
      <SiteTitle title={title} />
      <Navigation docs={docs} location={location} onStateChanged={onStateChanged} deltas={deltas} />
    </div>
  )
}

const DocumentationLayoutMedium = ({ children, location, data, onStateChanged, deltas }) => {
  const [menuActive, setMenuActive] = useState(false)
  const [prevLocation, setPrevLocation] = useState()

  const showMenu = () => {
    setMenuActive(!menuActive)
  }

  useEffect(() => {
    const currentPathName = location.pathname.replace(/\/$/, '')
    const currentHash = location.hash
    const currentLocation = `${currentPathName}${currentHash}`
    if (prevLocation !== currentLocation) {
      setPrevLocation(currentLocation)
      setMenuActive(false)
    }
  }, [location])

  const { site: { siteMetadata: { title } }, navigation: { docs }, file: { publicURL: menuButtonBackgroundImage } } = data
  return (
    <div css={{
      padding: '1rem'
    }}>
      <MobileNavigation menuActive={menuActive} title={title} docs={docs} location={location} onStateChanged={onStateChanged} deltas={deltas} />
      <MenuButton onClick={showMenu} backgroundImage={menuButtonBackgroundImage} css={{
        position: 'fixed',
        zIndex: 20,
        bottom: '30px',
        right: '30px',
        backgroundColor: menuActive ? '#F486CA' : 'white'
        // marginBottom: '10px'
      }} />
      { children }
    </div>
  )
}

export { DocumentationLayoutMedium }
