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
    // console.log('getActiveProps', this.linkClassName)
    // const normalizedPathName = currentLocation.pathname.replace(/\/$/, '')
    // if (`${normalizedPathName}${currentLocation.hash}` === href) {
    //   // return { className: `${this.linkClassName} active` }
    //   return { className: `active` }
    // }
    return null
  }

  recordLinkNode = node => {
    console.log('node', this.href, this.location)
    this.linkClassName = node && node.className
    console.log('this.linkClassName', this.linkClassName)
    if (`${this.location}${this.hash}` === this.href) {
      this.setState({ cln: `${this.linkClassName} active` })
      // return { className: `${this.linkClassName} active` }
      // return { className: `active` }
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
          { value }
        </NavigationLink>
      </li>
    )
  }
}

export { NavigationHeading }
