import ServiceManager from 'SvcManager'
import './GalleryView.scss'
import React from 'react'

class GalleryView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {

    this.props.setNavbarState({
      links: {
        settings: false,
        gallery: true,
        about: true,
        login: true,
        home: false
      }
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    return (
      <div className="gallery">
      </div>
    )
  }
}

export default GalleryView
























































