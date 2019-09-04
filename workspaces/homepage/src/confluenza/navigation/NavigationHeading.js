import React from 'react'
import GithubSlugger from 'github-slugger'

import { NavigationLink } from './NavigationLink'

class NavigationHeading extends React.Component {
  state = {
    cln: ''
  }

  getActiveProps = (currentLocation, href) => {
    this.location = currentLocation.pathname.replace(/\/$/, '')
    this.hash = currentLocation.hash
    this.href = href
    if (this.linkClassName) {
      if (`${this.location}${this.hash}` === this.href) {
        return { className: `${this.linkClassName} active` }
      } else {
        return { className: this.linkClassName }
      }
    }
    return null
  }

  recordLinkNode = node => {
    this.linkClassName = node && node.className
    if (`${this.location}${this.hash}` === this.href) {
      this.setState({ cln: `${this.linkClassName} active` })
    } else {
      this.setState({ cln: this.linkClassName })
    }
  }

  render () {
    const { path, value, index } = this.props
    const slugger = new GithubSlugger()
    const anchor = slugger.slug(value)
    return (
      <li key={index}>
        <NavigationLink
          to={`${path}#${anchor}`}
          ref={this.recordLinkNode}
          className={this.state.cln}
          getProps={({ location, href }) => this.getActiveProps(location, href)}
        >
          {value}
        </NavigationLink>
      </li>
    )
  }
}

export { NavigationHeading }
