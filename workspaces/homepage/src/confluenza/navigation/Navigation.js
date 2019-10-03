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
    userDeltas: [],
    betaDeltas: [],
    componentDeltas: [],
    developerDeltas: [],
    serviceDeltas: [],
    provisioningDeltas: [],
  }

  navigationGroups

  constructor (props) {
    super(props)

    this.scrollerRef = React.createRef()

    this.restoreNavigationState()

    this.navigationGroups = [
      this.createNavigationGroupForTag({
        title: 'Identity Box',
        tag: 'user',
        deltaGroupName: 'user'
      }),
      this.createNavigationGroupForTag({
        title: 'Early Adopters',
        tag: 'beta',
        deltaGroupName: 'beta'
      }),
      this.createNavigationGroupForTag({
        title: 'Developers',
        tag: 'developer',
        deltaGroupName: 'developer'
      }),
      this.createNavigationGroupForTag({
        title: 'Components',
        tag: 'component',
        deltaGroupName: 'component'
      }),
      this.createNavigationGroupForTag({
        title: 'Services',
        tag: 'service',
        deltaGroupName: 'service'
      }),
      this.createNavigationGroupForTag({
        title: 'Provisioning',
        tag: 'provisioning',
        deltaGroupName: 'provisioning'
      })
    ]
  }

  restoreNavigationState = () => {
    if (typeof window !== 'undefined') {
      const restoredState = this.readNavigationState()
      if (restoredState) {
        console.log('Restoring navigation state')
        // eslint-disable-next-line
        this.state = restoredState
      } else {
        console.log('[New Site!]: clearing persisted navigation state')
        this.clearNavigationState()
      }
    }
  }

  readNavigationState = () => {
    const stateJSON = window.localStorage.getItem('navigation')
    return this.validNavigationState(stateJSON)
  }

  clearNavigationState = () => {
    window.localStorage.clear()
  }

  validNavigationState = stateJSON => {
    if (stateJSON) {
      const restoredState = JSON.parse(stateJSON)
      const restoredStateKeys = Object.keys(restoredState)
      const currentStateKeys = Object.keys(this.state)
      if (currentStateKeys.every(e => restoredStateKeys.includes(e))) {
        return restoredState
      }
    }
    return undefined
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

  updateDeltas = (group, index, d) => {
    let deltas = [...this.state[`${group}Deltas`]]
    deltas[index] = d
    deltas = [...deltas].map(d => {
      if (d === undefined) {
        return 0
      }
      return d
    })
    this.setState({ [`${group}Deltas`]: deltas })
  }

  calculateRequiredScroll = ({ top, addedContentHeight, navigationElementTotalHeight }) => {
    const clientHeight = this.scrollerRef.current.clientHeight
    const requiredHeight = top + navigationElementTotalHeight + addedContentHeight
    const currentHeight = clientHeight + this.scrollerRef.current.scrollTop
    return requiredHeight - currentHeight
  }

  scrollBy = scrollAmount => {
    this.scrollerRef.current.scrollTop += scrollAmount
  }

  updateScrollPosition = ({ top, addedContentHeight, navigationElementTotalHeight }) => {
    if (addedContentHeight > 0 && this.scrollerRef.current) {
      setTimeout(() => {
        const requiredScroll = this.calculateRequiredScroll({
          top,
          addedContentHeight,
          navigationElementTotalHeight
        })
        if (requiredScroll > 0) {
          this.scrollBy(requiredScroll)
        }
      }, 500)
    }
  }

  getElementHeight = el => {
    if (typeof window !== 'undefined') {
      return Number(RegExp(/\d+/).exec(window.getComputedStyle(el).height)[0])
    }
    return 0
  }

  topLevelNavigationItemChanged = (delta, element, triggerElement) => {
    const navigationElementTotalHeight = this.getElementHeight(triggerElement)
    this.updateScrollPosition({
      top: element.offsetTop,
      addedContentHeight: delta,
      navigationElementTotalHeight
    })
  }

  midLevelNavigationItemChanged = (group, index, delta, element, triggerElement) => {
    this.updateDeltas(group, index, delta)

    const navigationElementTotalHeight = this.getElementHeight(triggerElement)

    this.updateScrollPosition({
      top: element.offsetTop,
      addedContentHeight: delta,
      navigationElementTotalHeight
    })
  }

  renderNavigationGroup = group => (
    <TopLevelNavigationItem
      key={group.tag}
      tag={group.tag}
      title={group.title}
      onChange={(delta, el, triggerElement) => this.topLevelNavigationItemChanged(delta, el, triggerElement)}
      active={this.isActive(group.docs)}
      delta={this.aggregateDeltas(this.state[`${group.deltaGroupName}Deltas`])}
    >
      <div>
        <List>
          {
            group.docs.map((doc, i) => (
              <NavigationItem
                key={i}
                location={this.props.location}
                {...doc}
                onChange={(delta, el, triggerElement) =>
                  this.midLevelNavigationItemChanged(group.deltaGroupName, i, delta, el, triggerElement)}
              />
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
  handleOnScroll = e => {
    clearTimeout(this.scrollTimer)
    this.scrollTimer = setTimeout(() => {
      if (this.scrollerRef.current) {
        this.scrollerRef.current.scrollTop = Math.max(1, Math.min(this.scrollerRef.current.scrollTop, this.scrollerRef.current.scrollHeight - this.scrollerRef.current.clientHeight - 1))
      }
    }, 200)
  }

  render () {
    return (
      <div
        onScroll={this.handleOnScroll} ref={this.scrollerRef} css={{
          overflowY: 'auto',
          position: 'relative',
          height: 'calc(100% - 20px - 2rem - 1.8rem - 98px)',
          '@media (orientation: landscape)': {
            height: 'calc(100% - 20px - 2rem - 1.8rem - 70px)'
          },
          WebkitOverflowScrolling: 'touch',
          '::-webkit-scrollbar': {
            width: '6px',
            height: '6px'
          },
          '::-webkit-scrollbar-thumb': {
            background: '#ccc'
          }
        }}
      >
        {this.navigationGroups.map(g => this.renderNavigationGroup(g))}
      </div>
    )
  }
}
