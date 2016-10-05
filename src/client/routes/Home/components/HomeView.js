import { IndexLink, Link } from 'react-router'
import ServiceManager from 'SvcManager'
import React from 'react'
import './HomeView.scss'

class HomeView extends React.Component {

  async componentDidMount () {

    try {

      const modelSvc = ServiceManager.getService(
        'ModelSvc')

      const models = await modelSvc.getModels(
        'forge-rcdb')

      console.log(models)

    } catch(ex) {

      console.log(ex)
    }
  }

  render() {

    const { viewerState } = this.props

    //57efaf0377c8eb0a560ef467

    return (
      <div className="home">
        <div className="title">
          <h2>Welcome!</h2>
          <Link to='/viewer?id=57efaead77c8eb0a560ef465' activeClassName='route--active'>
            Manufacturing Demo
          </Link>
            {'  -  '}
          <Link to='/viewer?id=57f3739777c879f48ad54a44' activeClassName='route--active'>
            AEC Demo
          </Link>
        </div>
        <img className='logo-hero' src="/resources/img/forge-hero.jpg"/>
      </div>
    )
  }
}

export default HomeView
