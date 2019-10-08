import React from 'react'
import './ImageGrid.scss'
import Image from 'Image'

class ImageGrid extends React.Component {
  /// //////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////
  render () {
    const items = this.props.images.map((img) => {
      return (
        <a key={img.link} href={img.link} target='_blank'>
          <button title={img.title}>
            <Image src={img.src} />
          </button>
        </a>
      )
    })

    return (
      <div className='image-grid'>
        {items}
      </div>
    )
  }
}

export default ImageGrid
