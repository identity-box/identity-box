import React from 'react'
import styled from '@emotion/styled'

import { Collapsable } from '../Collapsable'
import { NavigationLink } from '../NavigationLink'

const Wrapper = styled.div({
  position: 'relative',
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center'
})

class MidLevelNavigationItem extends React.Component {
  constructor (props) {
    super(props)

    this.triggerRef = React.createRef()
  }

  getActiveProps = (currentLocation, href) => {
    const normalizedPathName = currentLocation.pathname.replace(/\/$/, '')
    if (`${normalizedPathName}` === href) {
      return 'active'
    }
    return ''
  }

  onChange = (delta, collpasableElement) => {
    this.props.onChange(delta, collpasableElement, this.triggerRef.current)
  }

  render () {
    const { title, path, location } = this.props

    return (
      <Collapsable id={`collapsable${this.props.path}${this.props.title}`} onChange={this.onChange} trigger={(unfold, folded) => (
        <Wrapper onClick={() => unfold()}>
          <NavigationLink
            ref={this.triggerRef}
            to={path}
            className={this.getActiveProps(location, path)}
          >
            {title}
          </NavigationLink>
        </Wrapper>
      )}>
        <div style={{ marginLeft: '1rem', width: 'calc(100% - 1rem)' }}>
          { this.props.children }
        </div>
      </Collapsable>
    )
  }
}

export { MidLevelNavigationItem }
