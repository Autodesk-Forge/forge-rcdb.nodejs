import BaseComponent from 'BaseComponent'
import { ReactLoader } from 'Loader'
import ClientAPI from 'ClientAPI'
import JSONView from 'JSONView'
import React from 'react'

/////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////
class TokenAPI extends ClientAPI {

  constructor (baseUrl) {

    super (baseUrl)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getToken (auth) {

    const url = `/${auth}`

    return this.ajax({
      rawBody: true,
      url
    })
  }
}


export default class TokenView extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.tokenAPI = new TokenAPI('/api/forge/token')

    this.refreshToken = this.refreshToken.bind(this)

    this.state = {
      token: null
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {
  
    this.refreshToken()
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async refreshToken () {
  
    await this.setState({
      token: null
    })

    const token = 
      await this.tokenAPI.getToken(
        this.props.auth)

    this.setState({
      token
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    const {token} = this.state

    return(
      <div className="token">
        <button 
          className="btn-refresh" 
          onClick={this.refreshToken}>
          <span className="fa fa-refresh"/>
        </button>  
        <ReactLoader show={!token}/>
        { token && <JSONView src={token}/> }
      </div>
    )
  }
}
