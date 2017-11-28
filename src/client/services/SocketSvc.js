
import ioClient from 'socket.io-client'
import BaseSvc from './BaseSvc'

export default class SocketSvc extends BaseSvc {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (config) {

    super (config)

    this.eventBuffer = []
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  name () {

    return 'SocketSvc'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getSocketId () {

    return new Promise((resolve) => {

      if (this.socket) {

        return resolve(this.socket.id)
      }

      this.connect().then((socket) => {

        return resolve(socket.id)
      })
    })
  }

  /////////////////////////////////////////////////////////
  // Socket Connection handler
  //
  /////////////////////////////////////////////////////////
  connect () {

    return new Promise((resolve, reject) => {

      if (this.socket) {

        return resolve(this.socket)
      }

      this.socket = ioClient.connect(
        `${this._config.host}:${this._config.port}`, {
          reconnect: true
        })

      this.socket.on('connect', () => {

        console.log('Socket connected: ' + this.socket.id)

        this.eventBuffer.forEach((event) => {

          this.socket.on(event.msgId, event.handler)
        })

        resolve(this.socket)
      })
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  on (msgIds, handler) {

    msgIds.split(' ').forEach((msgId) => {

      this.eventBuffer.push({
        handler,
        msgId
      })

      if (this.socket) {

        this.socket.on (msgId, handler)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  off (msgIds, handler) {

    msgIds.split(' ').forEach((msgId) => {

      this.eventBuffer =
        this.eventBuffer.filter((event) => {
          return (event.msgId !== msgId)
        })

      if (this.socket) {

        this.socket.off (msgId, handler)
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async emit (msgId, msg) {

    if (this.socket) {

      this.socket.emit (msgId, msg)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async broadcast (msgId, msg, filter = null) {

    if (this.socket) {

      this.socket.emit('broadcast', {
        filter,
        msgId,
        msg
      })
    }
  }
}
