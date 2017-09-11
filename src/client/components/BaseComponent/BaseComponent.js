import React from 'react'

class BaseComponent extends React.Component {

  constructor(props) {
    super(props)
  }

  assignState (state) {
    return new Promise((resolve) => {
      const newState = Object.assign({}, this.state, state)
      this.setState(newState, () => {
        resolve()
      })
    })
  }
}

export default BaseComponent
