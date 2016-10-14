import { IndexLink, Link } from 'react-router'
import ServiceManager from 'SvcManager'
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
  async componentDidMount () {

    try {

      const modelSvc = ServiceManager.getService(
        'ModelSvc')

      const models = await modelSvc.getModels(
        'forge-rcdb')

      const modelsbyName =  _.sortBy(models,
        (model) => {
          return model.name
        })

      this.setState(Object.assign({}, this.state, {
        models: modelsbyName
      }))

    } catch(ex) {

      console.log(ex)
    }
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onModelClicked (model) {


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
        <div className="welcome">
          <h2>Welcome!</h2>
        </div>
        <img className='logo-hero' src="/resources/img/hero-banner.jpg"/>
        <div className="models">
          <div className="title">
            <img/>
            Select a model ...
          </div>

          <div className="content responsive-grid">

            {this.state.models.map((model) => {
              return (
                <a key={model.urn} href={`/viewer?id=${model._id}`}>
                  <figure>
                    <img src={"data:image/png;base64," + model.thumbnail}/>
                    <figcaption>
                    {model.name}
                    </figcaption>
                  </figure>
                </a>)
              })
            }
          </div>
        </div>
      </div>
    )
  }
}

export default HomeView
