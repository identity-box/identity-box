import React from 'react'
import GithubSlugger from 'github-slugger'
import styled from '@emotion/styled'

import { NavigationLink } from './NavigationLink'

const ListSubItem = styled.li({
  fontSize: '0.9rem'
})

class NavigationHeading extends React.Component {
  getActiveProps = (currentLocation, href) => {
    const normalizedPathName = currentLocation.pathname.replace(/\/$/, '')
    if (`${normalizedPathName}${currentLocation.hash}` === href) {
      return { className: `${this.linkClassName} active` }
    }
    return null
  }

  recordLinkNode = node => {
    this.linkClassName = node && node.className
  }

  render () {
    const { path, value, index } = this.props
    const slugger = new GithubSlugger()
    const anchor = slugger.slug(value)
    return (
      <ListSubItem key={index}>
        <NavigationLink
          to={`${path}#${anchor}`}
          ref={this.recordLinkNode}
          getProps={({ location, href }) => this.getActiveProps(location, href)}
        >
          { value }
        </NavigationLink>
      </ListSubItem>
    )
  }
}

export { NavigationHeading }
