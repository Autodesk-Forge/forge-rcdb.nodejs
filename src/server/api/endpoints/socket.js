
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'

module.exports = function() {

  var router = express.Router()

  /////////////////////////////////////////////////////////////////////////////
  // POST /message
  // Post socket message
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/message', async (req, res) => {

    try {
      
      var payload = JSON.parse(req.body.payload)

      var socketSvc = ServiceManager.getService(
        'SocketSvc')

      socketSvc.broadcast(
        payload.msgId,
        payload.msg,
        payload.filter)

      res.json(payload)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  return router
}