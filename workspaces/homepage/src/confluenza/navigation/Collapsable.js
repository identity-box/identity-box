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
    this.divRef = React.createRef()
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
        })
      }
    }
  }

  unfold = () => {
    if (this.state.folded) {
      this.props.onChange && this.props.onChange(this.divRef.current.scrollHeight)
      this.setState({
        folded: false,
        style: {
          ...this.state.style,
          maxHeight: `${this.divRef.current.scrollHeight}px`
        }
      })
    } else {
      this.props.onChange && this.props.onChange(0)
      this.setState({
        folded: true,
        style: {
          ...this.state.style,
          maxHeight: 0
        }
      })
    }
  }

  render () {
    return (
      <div>
        { this.props.trigger(this.unfold, this.state.folded) }
        <div style={this.state.style} ref={this.divRef}>
          { this.props.children }
        </div>
      </div>
    )
  }
}

export { Collapsable }
