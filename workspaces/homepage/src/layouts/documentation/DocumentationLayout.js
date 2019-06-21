import React, { useState, useLayoutEffect, useEffect, useRef } from 'react'
import 'src/prismjs/themes/prism-tomorrow.css'
import { StaticQuery, graphql } from 'gatsby'
import styled from '@emotion/styled'
import Media from 'react-media'
import { rhythm } from 'src/utils/typography'
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'

import { DocumentationLayoutGrid, SidebarGridItem, ContentGridItem } from './DocumentationLayoutGrid'
import { Navigation } from 'src/confluenza/navigation'
import { MenuButton } from 'src/confluenza/navigation/MenuButton'
import { SiteTitle } from './SiteTitle'

const MobileNavigation = ({ menuActive, title, docs, location }) => {
  // const targetRef = useRef(null)

  // useEffect(() => {
  //   return () => {
  //     clearAllBodyScrollLocks()
  //   }
  // }, [])

  // useEffect(() => {
  //   if (menuActive) {
  //     console.log(targetRef.current)
  //     disableBodyScroll(targetRef.current)
  //   } else {
  //     enableBodyScroll(targetRef.current)
  //   }
  // }, [menuActive])

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
      overflowY: 'auto',
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
      <Navigation docs={docs} location={location} />
    </div>
  )
}

export const FixedNavigation = styled.div({
  display: 'block',
  position: 'fixed',
  top: 0,
  minWidth: '300px',
  maxWidth: '300px',
  height: `calc(100vh - ${rhythm(2)})`,
  overflowY: 'auto',
  backgroundColor: '#F7F7F7',
  WebkitOverflowScrolling: `touch`,
  '::-webkit-scrollbar': {
    width: `6px`,
    height: `6px`
  },
  '::-webkit-scrollbar-thumb': {
    background: '#ccc'
  }
})

const DocumentationLayout = ({ children, location }) => {
  const [ menuActive, setMenuActive ] = useState(false)
  const [ prevLocation, setPrevLocation ] = useState()

  const showMenu = () => {
    setMenuActive(!menuActive)
  }

  // locationChanged = (currentLocation, href) => {
  //   const normalizedPathName = currentLocation.pathname.replace(/\/$/, '')
  //   if (`${normalizedPathName}` === href) {
  //     return 'active'
  //   }
  //   return ''
  // }

  useEffect(() => {
    const currentPathName = location.pathname.replace(/\/$/, '')
    const currentHash = location.hash
    const currentLocation = `${currentPathName}${currentHash}`
    console.log('I am rerendered!!!')
    if (prevLocation !== currentLocation) {
      console.log('locationChanged [c,p]', currentLocation, prevLocation)
      setPrevLocation(currentLocation)
      setMenuActive(false)
    }
    // console.log(location.pathname.replace(/\/$/, ''))
    // console.log(location.hash)
  }, [location])

  return (
    <StaticQuery
      query={graphql`
        query Navigation {
          site {
            siteMetadata {
              title
            }
          }
          file(base: { eq: "MenuButton.png" }) {
            publicURL
          }
          navigation: allMarkdownRemark(
            filter: { frontmatter: { path: { ne: "/404.html" } } }
            sort: { fields: [fileAbsolutePath], order: ASC }
          ) {
            docs: edges {
              node {
                frontmatter {
                  title
                  path
                  tag
                  content {
                    childMarkdownRemark {
                      html
                      headings(depth: h2) {
                        value
                      }
                    }
                  }
                }
                headings(depth: h2) {
                  value
                }
              }
            }
          }
        }
      `}
      render={data => {
        const { site: { siteMetadata: { title } }, navigation: { docs }, file: { publicURL: menuButtonBackgroundImage } } = data
        console.log('MenuActive:', menuActive)
        return (
          <Media query='(min-width: 1100px)'>
            {matches =>
              matches ? (
                <DocumentationLayoutGrid>
                  <SidebarGridItem>
                    <FixedNavigation>
                      <SiteTitle title={title} />
                      <Navigation docs={docs} location={location} />
                    </FixedNavigation>
                  </SidebarGridItem>
                  <ContentGridItem>
                    { children }
                  </ContentGridItem>
                </DocumentationLayoutGrid>
              ) : (
                <div css={{
                  padding: '98px 30px 30px 30px'
                }}>
                  <MobileNavigation menuActive={menuActive} title={title} docs={docs} location={location} />
                  <MenuButton onClick={showMenu} backgroundImage={menuButtonBackgroundImage} css={{
                    position: 'fixed',
                    zIndex: 20,
                    bottom: '30px',
                    right: '10px',
                    backgroundColor: menuActive ? '#F486CA' : 'white'
                    // marginBottom: '10px'
                  }} />
                  { menuActive ? <Media query='(min-width: 568px)' render={() => (
                    <>
                      { children }
                    </>
                  )} /> : children }

                </div>
              )
            }
          </Media>
        )
      }}
    />
  )
}

export { DocumentationLayout }
