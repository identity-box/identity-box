import React from 'react'
import Helmet from 'react-helmet'
import { EditFile } from 'src/confluenza/Editing'
import { graphql } from 'gatsby'

const Template = ({ data: { site: { siteMetadata }, doc }, location }) => {
  const { html, fileAbsolutePath, frontmatter: { title, content } } = doc
  const { editBaseUrl } = siteMetadata

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
  }
`

export default Template
