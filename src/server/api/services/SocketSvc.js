
import BaseSvc from './BaseSvc'
import io from 'socket.io'

export default class SocketSvc extends BaseSvc {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor (config) {

    super (config)

    this._connections = {}

    this.handleConnection =
      this.handleConnection.bind(this)

    this.handleDisconnection =
      this.handleDisconnection.bind(this)

    this._io = io(config.server)

    this._io.sockets.on(
      'connection',
      this.handleConnection)
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  name() {

    return 'SocketSvc'
  }

  ///////////////////////////////////////////////////////////////////
  // Socket Connection handler
  //
  ///////////////////////////////////////////////////////////////////
  handleConnection(socket) {

    //socket.handshake.session

    var _thisSvc = this

    _thisSvc._connections[socket.id] = socket

    socket.on('request.connection.data', ()=> {
      socket.emit('connection.data', {
        socketId: socket.id
      })
    })

    socket.on('disconnect', ()=> {

      _thisSvc.handleDisconnection(socket.id)
    })

    socket.on('broadcast', (data) => {

      let socketIds = Object.keys(_thisSvc._connections)

      let filter = socketIds.filter((socketId) => {
        return socketId !== socket.id
      })

      _thisSvc.broadcast(data.msgId, data.msg, filter)
    })

    _thisSvc.emit('SocketSvc.Connection', {
      id: socket.id
    })

    console.log('Socket connected: ' + socket.id)
  }

  ///////////////////////////////////////////////////////////////////
  // Socket Disconnection handler
  //
  ///////////////////////////////////////////////////////////////////
  handleDisconnection(id) {

    var _thisSvc = this

    _thisSvc.emit('SocketSvc.Disconnection', {
      id: id
    })

    if(_thisSvc._connections[id]){

      delete _thisSvc._connections[id]

      console.log('Socket disconnected: ' + id)
    }
  }

  ///////////////////////////////////////////////////////////////////
  // filter: array of socketIds to broadcast
  // If null, broadcast to every connected socket
  //
  ///////////////////////////////////////////////////////////////////
  broadcast(msgId, msg, filter = null) {

    var _thisSvc = this

    if(filter) {

      filter = Array.isArray(filter) ? filter : [filter]

      filter.forEach((socketId) => {

        if(_thisSvc._connections[socketId]){

          var socket = _thisSvc._connections[socketId]

          socket.emit(msgId, msg)
        }
      })
    }
    else {

      for(var socketId in _thisSvc._connections){

        var socket = _thisSvc._connections[socketId]

        socket.emit(msgId, msg)
      }
    }
  }
}
