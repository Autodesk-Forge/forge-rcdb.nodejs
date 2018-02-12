import { DropdownButton, MenuItem } from 'react-bootstrap'
import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
import ReactJson from 'react-json-view'
import { ReactLoader } from 'Loader'
import Payloads from './Payloads'
import Formats from './Formats'
import React from 'react'

export default class JobView extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.postJob = this.postJob.bind(this)
    this.onEdit = this.onEdit.bind(this)

    this.socketSvc =
      ServiceManager.getService(
        'SocketSvc')

    this.formats = [
      'dwg',
      'fbx',
      'ifc',
      'iges',
      'obj',
      'step',
      'svf',
      'stl'
    ]

    this.state = {
      selectedFormat: '',
      showLoader: false,
      payload: {}
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async getPayload (format, {model, guid}) {

    const params = {
      urn: model.urn,
      modelGuid: guid
    }

    return Payloads[format](params)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onSelect () {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onEdit ({updated_src}) {

    this.assignState({
      payload: updated_src
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async postJob () {

    try {

      const socketId = await this.socketSvc.getSocketId()

      const {database, dbModel} = this.props

      const {payload} = this.state

      this.assignState({
        showLoader: true
      })

      await this.props.derivativesAPI.postJob(
        database, dbModel._id,
        Object.assign({}, payload, {
          socketId
        }))

    } finally {

      this.assignState({
        showLoader: false
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const {model} = this.props.dbModel

    const {guid} = this.props

    const {
      selectedFormat,
      showLoader,
      payload
    } = this.state

    const fileExt = model.objectKey.split('.')[1]

    const formats =
      this.formats.filter((format) => {
          return Formats[format].includes(fileExt)
      })

    const menuItems = formats.map((format, idx) => {
      return (
        <MenuItem eventKey={idx} key={idx}
          onClick={async () => {
            this.assignState({
              payload: await this.getPayload(format, {model, guid}),
              selectedFormat: format
            })
          }}>
          { format }
        </MenuItem>
      )
    })

    return(
      <div className="job">
        <DropdownButton
          title={`Select export format: ${selectedFormat}`}
          key={'dropdown-job'}
          id={'dropdown-job'}>
            { menuItems }
        </DropdownButton>
        <button className="job-btn"
          disabled={!selectedFormat}
          onClick={this.postJob}>
          <span className="fa fa-cog"/>
            Post Job ...
        </button>
        <div className="payload">
          <ReactLoader show={showLoader}/>
          <ReactJson
            onSelect={this.onSelect}
            enableClipboard={false}
            onDelete={this.onEdit}
            onEdit={this.onEdit}
            onAdd={this.onEdit}
            src={payload}
            name={false}
          />
        </div>
      </div>
    )
  }
}
