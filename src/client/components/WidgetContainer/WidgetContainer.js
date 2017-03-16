
import ReactDOM from 'react-dom'
import './WidgetContainer.scss'
import React from 'react'

class WidgetContainer extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    className: React.PropTypes.string,
    showTitle: React.PropTypes.bool
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
  constructor () {

    super()

    this.state = {
      style: {}
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderTitle () {

    if (!this.props.showTitle) {

      return (<div></div>)
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

    const style = this.props.showTitle
      ? {height: 'calc(100% - 40px)'}
      : {height: '100%'}

    return (
      <div className={classNames.join(' ')}>
         { this.renderTitle() }
        <div className="content" style={style}>
          {this.renderChildren()}
        </div>
      </div>
    )
  }
}

export default WidgetContainer
