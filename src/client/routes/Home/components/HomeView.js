import ServiceManager from 'SvcManager'
import { Link } from 'react-router'
import React from 'react'
import './HomeView.scss'

class HomeView extends React.Component {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  state = {
    models: []
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async componentWillMount () {

    try {

      const falcorSvc = ServiceManager.getService(
        'FalcorSvc')

      falcorSvc.Models.get('length').then((response) =>  {
        //console.log(response.json)
      })

      falcorSvc.Models.get('[0..2]').then((response) =>  {
        //console.log(response.json)
        //console.log(response.json['0']['1'])
      })

      falcorSvc.Models.get(["byId", "57efaead77c8eb0a560ef465"]).then((response) =>  {
        //console.log(response ? response.json : 'null')
      })

      this.modelSvc = ServiceManager.getService(
        'ModelSvc')

      const models = await this.modelSvc.getModels(
        'forge-rcdb')

      const modelsbyName = _.sortBy(models,
        (model) => {
          return model.name
        })

      this.setState(Object.assign({}, this.state, {
        models: modelsbyName
      }))

      this.batchRequestThumbnails(3)

    } catch(ex) {

      console.log(ex)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  async componentDidUpdate () {

    $('svg').remove()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  batchRequestThumbnails (size) {

    _.chunk(this.state.models, size).forEach((modelChunk) => {

      const modelIds = modelChunk.map((model) => {
        return model._id
      })

      this.modelSvc.getThumbnails(
        'forge-rcdb', modelIds).then((thumbnails) => {

          const models = this.state.models.map((model) => {

            const idx = modelIds.indexOf(model._id)

            return (idx < 0 ?
              model :
              Object.assign({}, model, {thumbnail: thumbnails[idx]}))
          })

          this.setState(Object.assign({}, this.state, {
            models
          }))
        })
    })
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    const Text = ({content}) => {
      return (
        <p dangerouslySetInnerHTML={{__html: content}}></p>
      );
    }

    return (
      <div className="home">
        <img className='logo-hero'/>
        <div className="models">
          <div className="title">
            Choose Model
          </div>

          <div className="content responsive-grid">

            {this.state.models.map((model, idx) => {
              return (
                <Link key={idx} to={`/viewer?id=${model._id}`}>
                  <figure>
                    <figcaption>
                      {model.name}
                    </figcaption>
                    <img className={model.thumbnail ? "":"default-thumbnail"}
                      src={model.thumbnail ? model.thumbnail : ""}/>
                  </figure>
                </Link>)
              })
            }
          </div>
        </div>
      </div>
    )
  }
}

export default HomeView
























































