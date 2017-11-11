import ServiceManager from 'SvcManager'
import { Link } from 'react-router'
import sortBy from 'lodash/sortBy'
import Image from 'Image'
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

      const modelsbyName = sortBy(models,
        (model) => {
          return model.name
        })

      this.setState(Object.assign({}, this.state, {
        models: modelsbyName
      }))

      this.props.setNavbarState({
        links: {
          settings: false
        }
      })

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
























































