import React, { useState } from 'react'
import Helmet from 'react-helmet'
import Media from 'react-media'
import { EditFile } from 'src/confluenza/Editing'
import { MenuButton } from 'src/confluenza/navigation/MenuButton'
import { SiteTitle } from 'src/layouts/documentation/SiteTitle'
import { Navigation } from 'src/confluenza/navigation'
import { graphql } from 'gatsby'
import { rhythm } from 'src/utils/typography'

const MobileNavigation = ({ menuActive, title, docs, location }) => (
  <div css={{
    position: 'fixed',
    height: `calc(100vh - ${rhythm(2)})`,
    minWidth: '300px',
    maxWidth: '300px',
    overflowY: 'auto',
    backgroundColor: '#F7F7F7',
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

const Template = ({ data: { site: { siteMetadata }, doc, file: { publicURL: menuButtonBackgroundImage }, navigation: { docs } }, location }) => {
  const { html, fileAbsolutePath, frontmatter: { title, content } } = doc
  const { editBaseUrl } = siteMetadata

  const [ menuActive, setMenuActive ] = useState(false)

  const showMenu = () => {
    setMenuActive(true)
  }

  return (
    <div>
      <Helmet title={title}>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0' />
        <link href='https://fonts.googleapis.com/css?family=Roboto+Mono&display=swap' rel='stylesheet' />
      </Helmet>
      <EditFile fileAbsolutePath={fileAbsolutePath}
        externalContent={content}
        editBaseUrl={editBaseUrl} />
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content ? content.childMarkdownRemark.html.split('\n').slice(1).join('\n') : html }} />
      { content && html !== '' && <div dangerouslySetInnerHTML={{ __html: html }} />}
      <MobileNavigation menuActive={menuActive} title={siteMetadata.title} docs={docs} location={location} />
    </div>
  )
}

export const pageQuery = graphql`
  query MarkdownByPath($path: String!) {
    site: site {
      siteMetadata {
        title
        editBaseUrl
      }
    }
    doc: markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      fileAbsolutePath
      frontmatter {
        title
        content {
          childMarkdownRemark {
            html
            fileAbsolutePath
          }
        }
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
`

export default Template
