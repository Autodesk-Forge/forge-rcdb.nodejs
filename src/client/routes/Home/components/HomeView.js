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

    const Text = ({content}) => {
      return (
        <p dangerouslySetInnerHTML={{__html: content}}></p>
      );
    }

    return (
      <div className="home">
        <div className="title">
          <h2>Welcome!</h2>
          <br/>
          <br/>
          <br/>
          <Link className="link" to='/viewer?id=57efaead77c8eb0a560ef465' activeClassName='route--active'>
            <Text content="Manufacturing Demo"/>
          </Link>
          <p>{'  -  '}</p>
          <Link className="link" to='/viewer?id=57f3739777c879f48ad54a44' activeClassName='route--active'>
            <Text content="AEC Demo"/>
          </Link>
        </div>
        <img className='logo-hero' src="/resources/img/hero-banner.jpg"/>
        <div className="models">
        </div>
      </div>
    )
  }
}

export default HomeView
