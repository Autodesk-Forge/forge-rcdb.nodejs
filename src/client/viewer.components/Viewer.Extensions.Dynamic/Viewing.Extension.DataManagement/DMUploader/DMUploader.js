import ContentEditable from 'react-contenteditable'
import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
import Dropzone from 'react-dropzone'
import PropTypes from 'prop-types'
import './DMUploader.scss'
import React from 'react'

export default class DMUploader extends BaseComponent {

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

    this.dmAPI = this.props.api

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

    const {hubId, projectId, folderId, nodeId} = this.props

    const data = Object.assign({
      socketId,
      uploadId,
      nodeId,
      hubId
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

    this.dmAPI.upload(
      projectId, folderId,
      file, options)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return(
      <div className="dm-uploader">
        <Dropzone className="content"
          onDrop={this.onDrop}
          multiple={false} >
          <p>
            <span className="fa fa-cloud-upload"/>
            Drop a file here or click to browse ...
          </p>
        </Dropzone>
      </div>
    )
  }
}
