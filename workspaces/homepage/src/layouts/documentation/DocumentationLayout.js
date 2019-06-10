import { React } from 'react'
import 'src/prismjs/themes/prism-tomorrow.css'
import { StaticQuery, graphql } from 'gatsby'
import styled from '@emotion/styled'
import { rhythm } from 'src/utils/typography'

import { DocumentationLayoutGrid, SidebarGridItem, ContentGridItem } from './DocumentationLayoutGrid'
import { Navigation } from 'src/components/navigation'
import { SiteTitle } from './SiteTitle'

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

const DocumentationLayout = ({ children, location }) => (
  <StaticQuery
    query={graphql`
      query Navigation {
        site {
          siteMetadata {
            title
          }
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
      const { site: { siteMetadata: { title } }, navigation: { docs } } = data
      return (
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
      )
    }}
  />
)

export { DocumentationLayout }
