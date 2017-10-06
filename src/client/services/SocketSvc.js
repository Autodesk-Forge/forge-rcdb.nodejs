
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
  name() {

    return 'SocketSvc'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  getSocketId() {

    return new Promise((resolve, reject) => {

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
  connect() {

    return new Promise((resolve, reject) => {

      this.socket = ioClient.connect(
        `${this._config.host}:${this._config.port}`, {
          reconnect: true
        })

      this.socket.on('connect', () => {

        this.eventBuffer.forEach((event) => {

          this.socket.on(event.msgId, event.handler)
        })

        this.eventBuffer = []

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

      if (this.socket) {

        this.socket.on(msgId, handler)

      } else {

        this.eventBuffer.push({
          handler,
          msgId
        })
      }
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  off (msgIds, handler) {

    if (this.socket) {

      msgIds.split(' ').forEach((msgId) => {

        this.socket.off(msgId, handler)
      })
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async emit (msgId, msg) {

    if (this.socket) {

      this.socket.emit(msgId, msg)
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
