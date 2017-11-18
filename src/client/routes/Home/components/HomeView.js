import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
import { Link } from 'react-router'
import Image from 'Image'
import React from 'react'
import './HomeView.scss'

class HomeView extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {
    
    super ()

    this.storageSvc = ServiceManager.getService(
      'StorageSvc')

    this.modelSvc = ServiceManager.getService(
      'ModelSvc')

    this.state = {
      models: []
    }
  }
    
  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentWillMount () {

    const models = this.storageSvc.load(
      'rcdb.models', [])

    this.assignState({
      models
    })  

    this.modelSvc.getModels('rcdb').then(
      (dbModels) => {

        const dbModelsStr = JSON.stringify(dbModels)
        const modelsStr = JSON.stringify(models)

        if (dbModelsStr !== modelsStr) {

          this.storageSvc.save(
            'rcdb.models', 
            dbModels)

          this.assignState({
            models: dbModels
          })
        }
      })

    this.props.setNavbarState({
      links: {
        settings: false
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render() {

    return (
      <div className="home">
        <img className='forge-hero'/>
        <div className="models">
          <div className="title">
            Choose Model
          </div>

          <div className="content responsive-grid">

            {
              this.state.models.map((model, idx) => {

                const thumbnailUrl =
                  `/resources/img/thumbnails/rcdb/${model.name}.png`

                return (
                  <Link key={idx} to={`/database?id=${model._id}`}>
                    <figure>
                      <figcaption>
                      {model.name}
                      </figcaption>
                      <Image src={thumbnailUrl}/>
                      </figure>
                    </Link>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }
}

export default HomeView
























































