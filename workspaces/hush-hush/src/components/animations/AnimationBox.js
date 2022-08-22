import { Component } from 'react'

class AnimationBox extends Component {
  timer

  state = { animationProperty: this.props.startValue }

  componentDidMount () {
    this.timer = setTimeout(() => {
      this.setState({
        animationProperty: this.props.stopValue
      })
    })
  }

  componentWillUnmount () {
    clearTimeout(this.timer)
  }

  render () {
    return this.props.children(this.state.animationProperty)
  }
}

export { AnimationBox }
