import React from 'react'
import { intlShape } from 'react-intl'

class BaseComponent extends React.Component {

  constructor(props) {
    super(props)
    this.formatMessage = intlShape.formatMessage
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
