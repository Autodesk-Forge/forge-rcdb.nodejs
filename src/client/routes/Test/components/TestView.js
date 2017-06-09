import Toolkit from 'Viewer.Toolkit'
import Viewer from 'Viewer'
import React from 'react'

class TestView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onViewerCreated (viewer) {

    try {

      //viewer.start()

    } catch(ex) {

      console.log('Viewer Initialization Error: ')
      console.log(ex)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    return (
      <div className="test">
        <Viewer onViewerCreated={(data) => this.onViewerCreated(data)}
          style={{height:"calc(100vh - 65px)"}}/>
      </div>
    )
  }
}

export default TestView
























































