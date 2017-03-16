import React from 'react'

class Loader extends React.Component {

  render () {

    const className = 'loader-background' +
      (!this.props.show ? ' disabled' : '')

    const style = {
      transitionProperty: !this.props.show
        ? ' background' : 'none'
    }

    return (
      <div className={className} style={style}>
        <div className="loader">
        </div>
      </div>
    )
  }
}

export default Loader
