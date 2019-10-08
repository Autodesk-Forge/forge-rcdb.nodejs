import React from 'react'
import { ServiceContext } from 'ServiceContext'

class BaseComponent extends React.Component {
  constructor (props) {
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

BaseComponent.contextType = ServiceContext

export default BaseComponent
