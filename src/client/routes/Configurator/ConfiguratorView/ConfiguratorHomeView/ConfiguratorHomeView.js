import ServiceManager from 'SvcManager'
import './ConfiguratorHomeView.scss'
import { Link } from 'react-router'
import React from 'react'

class ConfiguratorHomeView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.state = {
      models: []
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentWillMount () {

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    const models = await this.modelSvc.getModels(
      'configurator')

    const modelsbyName = _.sortBy(models,
      (model) => {
        return model.name
      })

    this.setState(Object.assign({}, this.state, {
      models: modelsbyName
    }))
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const models = this.state.models.map((model) => {
      return (
        <div key={model._id}>
          <Link to={`/configurator?id=${model._id}`}>
            { model.name }
          </Link>
          <br/>
        </div>
      )
    })

    return (
      <div>
        { models }
      </div>
    )
  }
}

export default ConfiguratorHomeView























































