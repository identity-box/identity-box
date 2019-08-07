import React, { useState, useEffect } from 'react'

import { DocumentationLayoutGrid, SidebarGridItem, ContentGridItem } from './DocumentationLayoutGrid'
import { Navigation } from 'src/confluenza/navigation'
import { MenuButton } from 'src/confluenza/navigation/MenuButton'
import { SiteTitle } from './SiteTitle'

import { FixedNavigation } from './FixedNavigation'

import { useScrollResoration } from './useScrollRestoration'
import { useMobileDocumentNavigator } from './useMobileDocumentNavigator'

const DocumentationLayoutSmall = ({ children, location, data, onStateChanged, deltas }) => {
  const [menuActive, setMenuActive] = useState(false)
  const [position, setPosition] = useState('relative')
  const [grid, setGrid] = useState('300px 100vw')
  const [animationDelay, setAnimationDelay] = useState(0)

  const {
    recordScrollPosition,
    restoreScrollPosition,
    disableScrollRestoration
  } = useScrollResoration()

  const closeMenu = () => {
    setMenuActive(false)
    // we will be hiding menu - thus, we need to make sure that
    // document container is again scrollable before we see it
    setPosition('relative')
    setGrid('300px 100vw')
  }

  // toggleMenu is used to trigger opening menu, and one of
  // the two triggers to close it (the second closing trigger
  // is user selecting navigation item). Opening and closing
  // menu is finalized in the effect below that responds to
  // the menuActive change.
  const toggleMenu = () => {
    if (menuActive) {
      closeMenu()
    } else {
      setMenuActive(true)
      // record scroll position so that we can restore it if needed
      recordScrollPosition()
    }
    setAnimationDelay(0)
  }

  // This hook responds to the change of location: the user
  // selected a link in the navigation menu.
  useMobileDocumentNavigator({
    onNewPathSelected: () => {
      closeMenu()
      disableScrollRestoration()
      setAnimationDelay(0.3)
    },
    location
  }, [location])

  useEffect(() => {
    if (menuActive) {
      // We do not want to change to 'position: fixed' immediately as
      // this may be visible and create unpleasant visual effect.
      // The timeout is about the same as the transition duration in CSS.
      setTimeout(() => {
        setPosition('fixed')
        setGrid('100vw 100vw')
      }, 200)
    } else {
      // Restoring scroll position can only be effective
      // after position is set back to 'relative'
      // We have two cases: (1) closing menu is the explicit user
      // action (by pressing the "toggle menu" button) or (2) as
      // a result of changing location (user selected a new menu item).
      // In both cases we use the closeMenu function above to trigger
      // the closing process. We could not restore the scroll possition
      // right there as this would be too early - the changing from
      // 'position: fixed' to 'position: relative' needs to be effective
      // before we can change the scroll position.
      restoreScrollPosition()
    }
  }, [menuActive])

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
    <MenuButton onClick={toggleMenu} backgroundImage={menuButtonBackgroundImage} css={{
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
