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

      this.modelSvc = ServiceManager.getService('ModelSvc')

      const models = await this.modelSvc.getModels('rcdb')

      const modelsbyName = _.sortBy(models,
        (model) => {
          return model.name
        })

      this.setState(Object.assign({}, this.state, {
        models: modelsbyName
      }))

      this.batchRequestThumbnails(5)

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

    const chunks = _.chunk(this.state.models, size)

    chunks.forEach((modelChunk) => {

      const modelIds = modelChunk.map((model) => {
        return model._id
      })

      this.modelSvc.getThumbnails('rcdb', modelIds).then(
        (thumbnails) => {

          const models = this.state.models.map((model) => {

            const idx = modelIds.indexOf(model._id)

            return (idx < 0
              ? model
              : Object.assign({}, model, {
              thumbnail: thumbnails[idx]
            }))
          })

          this.setState(
            Object.assign({}, this.state, {
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
























































