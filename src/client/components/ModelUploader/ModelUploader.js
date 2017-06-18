import ModelUploaderAPI from './ModelUploader.API'
import Dropzone from 'react-dropzone'
import PropTypes from 'prop-types'
import './ModelUploader.scss'
import React from 'react'

export default class ModelUploader extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.api = new ModelUploaderAPI(this.props.apiUrl)

    this.onDrop = this.onDrop.bind(this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onDrop (files) {

    const file = files[0]

    if (this.props.onInitUpload) {

      this.props.onInitUpload(file)
    }

    const options = {
      progress: (percent) => {

        if (this.props.onProgress) {

          this.props.onProgress(file, percent)
        }
      },
      socketId: this.props.socketId
    }

    this.api.upload(file, options)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return(
      <div className="model-uploader">
        <Dropzone className="drop-target"
          onDrop={this.onDrop}
          multiple={false} >
          <p>
            Drop a file here or click to browse ...
          </p>
        </Dropzone>
      </div>
    )
  }
}
