import ReactDOM from 'react-dom'
import React from 'react'

class ResponsiveView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.state = {
      childIdx: 0
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    const domElement = ReactDOM.findDOMNode(this)

    const height = domElement.offsetHeight

    this.setState({
      childIdx: (height < this.props.breakPoint ? 0 : 1)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return React.cloneElement (
      this.props.children[this.state.childIdx],
      this.props)
  }
}

export default ResponsiveView
