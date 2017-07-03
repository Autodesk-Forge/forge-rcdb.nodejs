//import fetchInject from 'fetch-inject'
import React from 'react'

export default class ScriptLoader extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  loadScript (url) {

    return new Promise((resolve, reject) => {

      const head = document.head ||
        document.getElementsByTagName("head")[0]

      let script = document.createElement("script")

      script.type = "text\/javascript"
      script.async = true

      script.onerror = (err) => reject(err)

      script.onload = () => resolve ()

      head.appendChild(script)

      script.src = url
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  toArray (obj) {

    return obj ? (Array.isArray(obj) ? obj : [obj]) : []
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    const urls = this.toArray(this.props.url)

    const loadTasks = urls.map((url) => {

      return this.loadScript(url)
    })

    Promise.all(loadTasks).then(() => {

      if (this.props.onLoaded) {

        this.props.onLoaded()
      }
    }, (error) => {

      if (this.props.onError) {

        this.props.onError()
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return <div/>
  }
}
