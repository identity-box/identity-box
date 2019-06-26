import React from 'react'
import styled from '@emotion/styled'

const A = styled.a({
  // fontFamily: 'Roboto Mono, monospace',
  fontFamily: 'Roboto Condensed, sans-serif',
  fontWeight: '100',
  fontSize: '0.9rem',
  color: '#FF55BE',
  marginRight: '2rem',
  '@media (max-width: 420px)': {
    marginRight: '10px'
  },
  '&:hover': {
    textDecoration: 'underline',
    color: '#FF55BE'
  }
})

const Wrapper = styled.div({
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  paddingLeft: '3px'
})

class EditFile extends React.Component {
  renderEditThisPageLink = (fileAbsolutePath, linkText) => {
    const match = fileAbsolutePath.match(/.*\/(workspaces.*)$/) || fileAbsolutePath.match(/.*\/(.*)$/)
    if (match) {
      const fileRelativePath = match[1]
      const { editBaseUrl } = this.props
      return (
        <A href={`${editBaseUrl}/${fileRelativePath}`}>{linkText}</A>
      )
    }
    return null
  }

  renderOriginalContent = fileAbsolutePath => {
    return this.renderEditThisPageLink(fileAbsolutePath, 'Edit this page')
  }

  renderExternalContent = externalContent => {
    if (externalContent) {
      const fileAbsolutePath = externalContent.childMarkdownRemark.fileAbsolutePath
      return this.renderEditThisPageLink(fileAbsolutePath, 'Edit external content page')
    }
    return null
  }

  render () {
    const { fileAbsolutePath, externalContent } = this.props

    return (
      <Wrapper>
        { this.renderOriginalContent(fileAbsolutePath) }
        { this.renderExternalContent(externalContent) }
      </Wrapper>
    )
  }
}

export { EditFile }
