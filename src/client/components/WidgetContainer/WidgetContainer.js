import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import './WidgetContainer.scss'
import React from 'react'

class WidgetContainer extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    className: PropTypes.string,
    showTitle: PropTypes.bool
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    showTitle: true,
    className: ''
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    if (!this.props.showTitle) {

      return <div/>
    }

    if (this.props.renderTitle) {

      return this.props.renderTitle()
    }

    return (
      <div className="title">
        <label>
          { this.props.title }
        </label>
      </div>
    )
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  renderChildren() {

    if (this.props.dimensions) {

      return React.Children.map(this.props.children, (child) => {

        const newProps = Object.assign({},
          child.props, {
            dimensions: this.props.dimensions
          })

        return React.cloneElement(child, newProps)
      })
    }

    return this.props.children
  }

  ///////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////
  render() {

    const classNames = [
      'widget-container',
      ...this.props.className.split(' ')
    ]

    const height = this.props.showTitle
      ? 'calc(100% - 40px)'
      : '100%'

    return (
      <div className={classNames.join(' ')} style={this.props.style}>
         { this.renderTitle() }
        <div className="content" style={{height}}>
          {this.renderChildren()}
        </div>
      </div>
    )
  }
}

export default WidgetContainer
