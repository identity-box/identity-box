import React from 'react'
import styled from '@emotion/styled'

import { MidLevelNavigationItem } from './mid-level-navigation-item'
import { NavigationHeading } from './NavigationHeading'

const List = styled.ul({
  listStyle: 'none',
  paddingTop: '0.5rem',
  paddingBottom: 0,
  margin: 0
})

class NavigationItem extends React.Component {
  renderNavigationHeading = (heading, index, path) => (
    <NavigationHeading key={index} {...heading} path={path} index={index} />
  )

  combineHeadings = (originalHeadings, content) => {
    const externalHeadings = content ? content.childMarkdownRemark.headings : []
    return externalHeadings.concat(originalHeadings)
  }

  render () {
    const { node: { headings, frontmatter: { title, path, content } }, onChange, location } = this.props

    const actualHeadings = this.combineHeadings(headings, content)

    return (
      <li key={path}>
        <MidLevelNavigationItem location={location} path={path} title={title} onChange={onChange}>
          { actualHeadings.length > 0 && <List>
            { actualHeadings.map((heading, index) => this.renderNavigationHeading(heading, index, path)) }
          </List> }
        </MidLevelNavigationItem>
      </li>
    )
  }
}

export { NavigationItem }
