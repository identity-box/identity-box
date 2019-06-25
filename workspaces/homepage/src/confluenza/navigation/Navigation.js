import React from 'react'
import styled from '@emotion/styled'

import { TopLevelNavigationItem } from './top-level-navigation-item'
import { NavigationItem } from './NavigationItem'

const List = styled.ul({
  listStyle: 'none',
  paddingTop: '0.5rem',
  paddingBottom: 0,
  margin: 0
})

export class Navigation extends React.PureComponent {
  state = {
    // proposalDeltas: [],
    componentDeltas: [],
    developerDeltas: []
  }

  navigationGroups

  constructor (props) {
    super(props)

    this.scrollerRef = React.createRef()

    if (typeof window !== 'undefined') {
      const stateJSON = window.localStorage.getItem('navigation')
      if (stateJSON) {
        this.state = JSON.parse(stateJSON)
      }
    }

    this.navigationGroups = [
      // this.createNavigationGroupForTag({
      //   title: 'Project Proposal',
      //   tag: 'proposal',
      //   deltaGroupName: 'proposal'
      // }),
      this.createNavigationGroupForTag({
        title: 'Developers',
        tag: 'developer',
        deltaGroupName: 'developer'
      }),
      this.createNavigationGroupForTag({
        title: 'Components',
        tag: 'component',
        deltaGroupName: 'component'
      })
    ]
  }

  createNavigationGroupForTag = ({ title, tag, deltaGroupName }) => {
    return {
      title,
      docs: this.props.docs.filter(d => d.node.frontmatter.tag === tag),
      tag,
      deltaGroupName
    }
  }

  aggregateDeltas = deltas => {
    if (deltas.length > 0) {
      return deltas.reduce((acc, val) => acc + val)
    }
    return 0
  }

  isActive = docs => {
    if (docs && docs.length > 0) {
      const filtered = docs.filter(d => d.node.frontmatter.path === this.props.location.pathname.replace(/\/$/, ''))
      return filtered.length > 0
    }
    return false
  }

  setDelta = (group, index, d, el) => {
    const deltas = [...this.state[`${group}Deltas`]]
    deltas[index] = d
    this.setState({ [`${group}Deltas`]: deltas })
    const oldScrollHeight = this.scrollerRef.current.scrollHeight
    const clientHeight = this.scrollerRef.current.clientHeight
    if (d > 0) {
      setTimeout(() => {
        const delta = this.scrollerRef.current.scrollHeight - oldScrollHeight
        if (delta > 0) {
          const navigationLinkHeight = 24
          const navigationLinkMargin = 0.8 * 16
          const requiredScroll = el.offsetTop + navigationLinkHeight + delta - (clientHeight + this.scrollerRef.current.scrollTop) + navigationLinkMargin
          if (requiredScroll > 0) {
            this.scrollerRef.current.scrollTop = this.scrollerRef.current.scrollTop + requiredScroll
          }
        }
      }, 500)
    }
  }

  topLevelNavigationOnChange = (delta, el) => {
    if (delta > 0) {
      const oldScrollHeight = this.scrollerRef.current.scrollHeight
      const clientHeight = this.scrollerRef.current.clientHeight
      setTimeout(() => {
        const scrollDelta = this.scrollerRef.current.scrollHeight - oldScrollHeight
        if (scrollDelta > 0) {
          const navigationLinkHeight = 41
          const requiredScroll = el.offsetTop + navigationLinkHeight + scrollDelta - (clientHeight + this.scrollerRef.current.scrollTop)
          if (requiredScroll > 0) {
            this.scrollerRef.current.scrollTop = this.scrollerRef.current.scrollTop + requiredScroll
          }
        }
      }, 500)
    }
  }

  renderNavigationGroup = group => (
    <TopLevelNavigationItem
      key={group.tag}
      tag={group.tag}
      title={group.title}
      onChange={(delta, el) => this.topLevelNavigationOnChange(delta, el)}
      active={this.isActive(group.docs)}
      delta={this.aggregateDeltas(this.state[`${group.deltaGroupName}Deltas`])}>
      <div>
        <List>
          {
            group.docs.map((doc, i) => (
              <NavigationItem key={i} location={this.props.location} {...doc} onChange={(delta, el) => this.setDelta(group.deltaGroupName, i, delta, el)} />
            ))
          }
        </List>
      </div>
    </TopLevelNavigationItem>
  )

  componentDidMount () {
    this.scrollerRef.current.scrollTop = Math.max(1, Math.min(this.scrollerRef.current.scrollTop, this.scrollerRef.current.scrollHeight - this.scrollerRef.current.clientHeight - 1))
  }

  componentDidUpdate () {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('navigation', JSON.stringify(this.state))
    }
  }

  // This is insane, but seem to do miracles on iOS: https://stackoverflow.com/a/51998690/1272679
  onScroll = e => {
    clearTimeout(this.scrollTimer)
    this.scrollTimer = setTimeout(() => {
      this.scrollerRef.current.scrollTop = Math.max(1, Math.min(this.scrollerRef.current.scrollTop, this.scrollerRef.current.scrollHeight - this.scrollerRef.current.clientHeight - 1))
    }, 200)
  }

  render () {
    return (
      <div onScroll={this.onScroll} ref={this.scrollerRef} css={{
        overflowY: 'auto',
        position: 'relative',
        height: 'calc(100% - 20px - 2rem - 1.8rem - 98px)',
        '@media (orientation: landscape)': {
          height: 'calc(100% - 20px - 2rem - 1.8rem - 70px)'
        },
        WebkitOverflowScrolling: `touch`,
        '::-webkit-scrollbar': {
          width: `6px`,
          height: `6px`
        },
        '::-webkit-scrollbar-thumb': {
          background: '#ccc'
        }
      }}>
        { this.navigationGroups.map(g => this.renderNavigationGroup(g))}
      </div>
    )
  }
}
