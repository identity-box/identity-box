import React from 'react'

class Collapsable extends React.Component {
  state = {
    folded: true,
    delta: 0,
    style: {
      display: 'flex',
      flexFlow: 'column nowrap',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      maxHeight: 0,
      overflow: 'hidden',
      transition: 'max-height 0.2s ease-out'
    }
  }

  constructor (props) {
    super(props)
    if (typeof window !== 'undefined') {
      const stateJSON = localStorage.getItem(props.id)
      if (stateJSON) {
        this.state = JSON.parse(stateJSON)
      }
    }
    this.divRef = React.createRef()
    this.wrapperRef = React.createRef()
  }

  componentDidMount () {
    const actualHeight = this.divRef.current.scrollHeight
    const restoredHeight = Number(RegExp(/\d+/).exec(this.state.style.maxHeight)[0])
    if (restoredHeight > 0 && restoredHeight < actualHeight) {
      this.props.onChange && this.props.onChange(actualHeight, this.wrapperRef.current)
      this.setState({
        style: {
          ...this.state.style,
          maxHeight: `${actualHeight}px`
        }
      }, () => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.props.id, JSON.stringify(this.state))
        }
      })
    }
  }

  componentDidUpdate (prevProps) {
    if (this.props.delta !== prevProps.delta) {
      if (!this.state.folded) {
        this.setState({
          delta: this.props.delta,
          style: {
            ...this.state.style,
            maxHeight: `${this.divRef.current.scrollHeight + this.props.delta}px`
          }
        }, () => {
          if (typeof window !== 'undefined') {
            localStorage.setItem(this.props.id, JSON.stringify(this.state))
          }
        })
      }
    }
  }

  unfold = () => {
    if (this.state.folded) {
      this.props.onChange && this.props.onChange(this.divRef.current.scrollHeight, this.wrapperRef.current)
      this.setState({
        folded: false,
        style: {
          ...this.state.style,
          maxHeight: `${this.divRef.current.scrollHeight}px`
        }
      }, () => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.props.id, JSON.stringify(this.state))
        }
      })
    } else {
      this.props.onChange && this.props.onChange(0, this.wrapperRef.current)
      this.setState({
        folded: true,
        style: {
          ...this.state.style,
          maxHeight: 0
        }
      }, () => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.props.id, JSON.stringify(this.state))
        }
      })
    }
  }

  render () {
    return (
      <div ref={this.wrapperRef}>
        {this.props.trigger(this.unfold, this.state.folded)}
        <div style={this.state.style} ref={this.divRef}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export { Collapsable }
