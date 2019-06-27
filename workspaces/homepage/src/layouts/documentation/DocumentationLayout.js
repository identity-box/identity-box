import React from 'react'
import 'src/prismjs/themes/prism-tomorrow.css'
import { StaticQuery, graphql } from 'gatsby'
import Media from 'react-media'

import { useUnusualReloader } from './useUnusualReloader'

import { DocumentationLayoutSmall } from './DocumentationLayoutSmall'
import { DocumentationLayoutMedium } from './DocumentationLayoutMedium'
import { DocumentationLayoutWide } from './DocumentationLayoutWide'

const DocumentationLayout = ({ children, location }) => {
  const pageReady = useUnusualReloader(location)
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
        if (!pageReady) {
          return null
        }
        return (
          <Media query='(min-width: 1100px)'>
            {matches =>
              matches ? (
                <DocumentationLayoutWide location={location} data={data}>
                  { children }
                </DocumentationLayoutWide>
              ) : (
                <Media query='(min-width: 768px)'>
                  {matches =>
                    matches ? (
                      <DocumentationLayoutMedium location={location} data={data}>
                        { children }
                      </DocumentationLayoutMedium>
                    ) : (
                      <DocumentationLayoutSmall location={location} data={data}>
                        { children }
                      </DocumentationLayoutSmall>
                    )
                  }
                </Media>
              )
            }
          </Media>
        )
      }}
    />
  )
}

export { DocumentationLayout }
