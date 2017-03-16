import 'Dialogs/dialogs.scss'
import Header from 'Header'
import React from 'react'
import 'core.scss'

class CoreLayout extends React.Component {

  static propTypes = {
    children : React.PropTypes.element.isRequired
  }

  render () {

    const { appState, children } = this.props

    return (
      <div className='container text-center'>
        <link rel="stylesheet" type="text/css"
          href={appState.storage.theme.css}
        />
        <Header {...this.props} />
        <div className='core-layout__viewport'>
          {children}
        </div>
      </div>
    )
  }
}

export default CoreLayout
