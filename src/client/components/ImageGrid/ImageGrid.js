import React from 'react'
import './ImageGrid.scss'

class ImageGrid extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const items = this.props.images.map((img) => {

      return (
        <a key={img.link} href={img.link} target="_blank">
          <button title={img.title}>
            <img src={img.src}/>
          </button>
        </a>
      )
    })

    return (
      <div className={"image-grid " + this.props.size}>
        {items}
      </div>
    )
  }
}

export default ImageGrid
