import React, { useState } from 'react'

import { DocumentationLayoutGrid, SidebarGridItem, ContentGridItem } from './DocumentationLayoutGrid'
import { Navigation } from 'src/confluenza/navigation'
import { MenuButton } from 'src/confluenza/navigation/MenuButton'
import { SiteTitle } from './SiteTitle'

import { FixedNavigation } from './FixedNavigation'

import { useScrollResoration } from './useScrollRestoration'
import { useMobileDocumentNavigator } from './useMobileDocumentNavigator'

const DocumentationLayoutSmall = ({ children, location, data, onStateChanged, deltas }) => {
  const [ menuActive, setMenuActive ] = useState(false)
  const [ position, setPosition ] = useState('relative')
  const [ grid, setGrid ] = useState('300px 100vw')
  const [ animationDelay, setAnimationDelay ] = useState(0)

  const {
    recordScrollPosition,
    restoreScrollPosition,
    disableScrollRestoration
  } = useScrollResoration()

  const showMenu = () => {
    if (menuActive) {
      setMenuActive(false)
      // we will be hiding menu - thus, we need to make sure that
      // document container is again scrollable before we see it
      setPosition('relative')
      setGrid('300px 100vw')
    } else {
      setMenuActive(true)
      // record scroll position so that we can restore it if needed
      recordScrollPosition()
    }
    setAnimationDelay(0)
  }

  useMobileDocumentNavigator({
    disableScrollRestoration,
    onNewPathSelected: () => {
      setMenuActive(false)
      setPosition('relative')
      setGrid('300px 100vw')
      setAnimationDelay(0.3)
    },
    onNoNewPathSelected: () => {
      if (menuActive) {
        setTimeout(() => {
          setPosition('fixed')
          setGrid('100vw 100vw')
        }, 200)
      } else {
        restoreScrollPosition()
      }
    },
    location
  }, [location, menuActive])

  const { site: { siteMetadata: { title } }, navigation: { docs }, file: { publicURL: menuButtonBackgroundImage } } = data
  return (<>
    <DocumentationLayoutGrid css={{
      position,
      height: '100vh',
      left: menuActive ? 0 : '-300px',
      margin: 0,
      gridGap: 0,
      gridTemplateColumns: grid,
      transition: `all .2s ease-in-out ${animationDelay}s`
    }}>
      <SidebarGridItem>
        <FixedNavigation css={{
          minWidth: menuActive ? '100vw' : '300px',
          maxWidth: menuActive ? '100vw' : '300px',
          transition: `all .2s ease-in-out ${animationDelay}s`,
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
