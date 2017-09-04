import ServiceManager from 'SvcManager'
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

    this.dialogSvc = ServiceManager.getService(
      'DialogSvc')

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    this.onDrop = this.onDrop.bind(this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  guid (format = 'xxxxxxxxxx') {

    var d = new Date().getTime()

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })

    return guid
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  isComposite (file) {

    return new Promise ((resolve) => {

      const filename = file.name.toLowerCase()

      if (filename.endsWith('.zip')) {

        const onClose = (result) => {

          resolve(result === 'OK')

          this.dialogSvc.off('dialog.close', onClose)
        }

        this.dialogSvc.on('dialog.close', onClose)

        this.dialogSvc.setState({
          className: 'composite-dlg',
          title: 'Composite Model',
          onRequestClose: () => {},
          captionCancel: 'NO',
          captionOK: 'Yes',
          content:
            <div>
              <p>
                Are you uploading a composite model?
              </p>
            </div>,
          open: true
        })

      } else {

        resolve(false)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onDrop (files) {

    const approved = await this.props.onDropFiles(files)

    if (approved) {

      const uploadId = this.guid()

      const file = files[0]

      const options = {
        progress: (percent) => {

          if (this.props.onProgress) {

            this.props.onProgress({
              uploadId,
              percent,
              file
            })
          }
        },
        data: {
          socketId: this.props.socketId,
          uploadId
        }
      }

      const composite = await this.isComposite(file)

      if (this.props.onInitUpload) {

        this.props.onInitUpload({
          uploadId,
          file
        })
      }

      this.modelSvc.upload(
        this.props.database,
        file, options)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return(
      <div className="model-uploader">
        <div className="title">
          <span className="fa fa-cloud-upload"/>
          <label>
            Upload your Model
          </label>
        </div>
        <Dropzone className="content"
          onDrop={this.onDrop}
          multiple={false} >
          <p>
            Drop a file here or click to browse ...
          </p>
          <hr/>
          <p>
            Your model will be available for
              <br/>
            <u>30 days</u>
          </p>
        </Dropzone>
      </div>
    )
  }
}
