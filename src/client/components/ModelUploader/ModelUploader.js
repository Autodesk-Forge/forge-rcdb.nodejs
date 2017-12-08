import ContentEditable from 'react-contenteditable'
import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
import Dropzone from 'react-dropzone'
import PropTypes from 'prop-types'
import './ModelUploader.scss'
import React from 'react'

export default class ModelUploader extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.socketSvc = ServiceManager.getService(
      'SocketSvc')

    this.dialogSvc = ServiceManager.getService(
      'DialogSvc')

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    this.onDrop = this.onDrop.bind(this)

    this.state = {
      rootFilename: null
    }
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
  onKeyDown (e) {

    if (e.keyCode === 13) {

      e.stopPropagation()
      e.preventDefault()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onRootFilenameChanged (e) {

    this.assignState({
      rootFilename: e.target.value
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  isComposite (file) {

    return new Promise ((resolve) => {

      const filename = file.name

      const rootFilename =
        filename.substring(
          0, filename.length - 4)

      if (filename.endsWith('.zip')) {

        const onClose = (result) => {

          this.dialogSvc.off('dialog.close', onClose)

          return (result === 'OK')
            ? resolve(this.state.rootFilename || rootFilename)
            : resolve(false)
        }

        this.dialogSvc.on('dialog.close', onClose)

        this.assignState({
          rootFilename: null
        })

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
              <ContentEditable
                data-placeholder={`Specify root filename: ${rootFilename}`}
                onChange={(e) => this.onRootFilenameChanged(e)}
                onKeyDown={(e) => this.onKeyDown(e)}
                html={this.state.rootFilename}
                className="root-filename"
              />
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

    const validUpload = await this.props.onFileDrop(files)

    if (validUpload) {

      const composite = await this.isComposite(files[0])

      const uploadId = this.guid()

      const file = files[0]

      if (this.props.onInitUpload) {

        this.props.onInitUpload({
          uploadId,
          file
        })
      }

      const socketId = await this.socketSvc.getSocketId()

      const data = Object.assign({
        socketId,
        uploadId
      }, !!composite
        ? {
            rootFilename: composite
          }
        : null)

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
        data
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
  renderContent () {

    const { user } = this.props

    if (user) {

      if (user.allowedUploads !== undefined &&
          user.allowedUploads <= 0) {

        return (
          <div className="limit">
            <p>
              You have reached your maximum active models quota :(
            </p>
            <hr/>
            <p>
              Wait for your current models to expire
              before being able to upload again ...
            </p>
          </div>
        )
      }

      return (
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
      )
    }

    return (
      <div className="login">
        <p>
          In order to upload models ...
        </p>
        <hr/>
        <p>
          You must be &nbsp;
          <u onClick={this.props.onLogIn}>
            logged in
          </u>
        </p>
      </div>
    )
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
        { this.renderContent() }
      </div>
    )
  }
}
