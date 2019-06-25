import React, { useState, useEffect, useRef } from 'react'
import { navigate } from 'gatsby'
// import { rhythm } from 'src/utils/typography'

import { DocumentationLayoutGrid, SidebarGridItem, ContentGridItem } from './DocumentationLayoutGrid'
import { Navigation } from 'src/confluenza/navigation'
import { MenuButton } from 'src/confluenza/navigation/MenuButton'
import { SiteTitle } from './SiteTitle'

import { FixedNavigation } from './FixedNavigation'

const DocumentationLayoutSmall = ({ children, location, data, onStateChanged, deltas }) => {
  const [ menuActive, setMenuActive ] = useState(false)
  const [ position, setPosition ] = useState('relative')
  const [ prevLocation, setPrevLocation ] = useState()
  const [ grid, setGrid ] = useState('300px 100vw')
  const scrollPos = useRef(null)

  const showMenu = () => {
    if (!menuActive) {
      scrollPos.current = document.documentElement.scrollTop || document.body.scrollTop
    }
    setMenuActive(!menuActive)
  }

  useEffect(() => {
    const currentPathName = location.pathname.replace(/\/$/, '')
    const currentHash = location.hash
    const currentLocation = `${currentPathName}${currentHash}`
    if (prevLocation !== currentLocation) {
      scrollPos.current = -1
      setPrevLocation(currentLocation)
      navigate(currentLocation)
      setMenuActive(false)
      return
    }
    if (!menuActive) {
      if (scrollPos.current !== -1) {
        document.documentElement.scrollTop = document.body.scrollTop = scrollPos.current
      }
      setPosition('relative')
      setGrid('300px 100vw')
    } else {
      setTimeout(() => {
        setPosition('fixed')
        setGrid('100vw 100vw')
      }, 200)
    }
  }, [location, menuActive])

  const { site: { siteMetadata: { title } }, navigation: { docs }, file: { publicURL: menuButtonBackgroundImage } } = data
  return (<>
    <DocumentationLayoutGrid css={{
      position: menuActive ? position : 'relative',
      height: '100vh',
      left: menuActive ? 0 : '-300px',
      margin: 0,
      gridGap: 0,
      gridTemplateColumns: grid,
      transition: 'left .2s ease-in-out 0s'
    }}>
      <SidebarGridItem>
        <FixedNavigation css={{
          minWidth: menuActive ? '100vw' : '300px',
          maxWidth: menuActive ? '100vw' : '300px',
          transition: 'all .2s ease-in-out 0s',
          height: '100vh'
        }}>
          <SiteTitle title={title} />
          <Navigation docs={docs} location={location} onStateChanged={onStateChanged} deltas={deltas} />
        </FixedNavigation>
      </SidebarGridItem>
      <ContentGridItem>
        { children }
      </ContentGridItem>
    </DocumentationLayoutGrid>
    <MenuButton onClick={showMenu} backgroundImage={menuButtonBackgroundImage} css={{
      position: 'fixed',
      zIndex: 20,
      bottom: '30px',
      right: '30px',
      backgroundColor: menuActive ? '#F486CA' : 'white'
    }} />
    </>
  )
}

export { DocumentationLayoutSmall }
