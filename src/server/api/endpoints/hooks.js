
import ServiceManager from '../services/SvcManager'
import compression from 'compression'
import express from 'express'

module.exports = function () {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const router = express.Router()

  const shouldCompress = (req, res) => {
    return true
  }

  router.use(compression({
    filter: shouldCompress
  }))

  /////////////////////////////////////////////////////////
  // GET /hooks
  // Get All Hooks
  //
  /////////////////////////////////////////////////////////
  router.get('/', async (req, res) => {

    try {

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

      const response = await forgeSvc.getHooks(token)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /hooks/systems/systemId
  // Get System Hooks
  //
  /////////////////////////////////////////////////////////
  router.get('/systems/:systemId', async (req, res) => {

    try {

      const { systemId } = req.params

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

      const response =
        await forgeSvc.getSystemHooks(
          token, systemId)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /hooks/systems/systemId/events/eventId
  // Get Event Hooks
  //
  /////////////////////////////////////////////////////////
  router.get('/systems/:systemId/events/:eventId', async (req, res) => {

    try {

      const { systemId, eventId } = req.params

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

      const response =
        await forgeSvc.getEventHooks(
          token, systemId, eventId)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // POST /hooks/systems/:systemId
  // Create System Hook
  //
  /////////////////////////////////////////////////////////
  router.post('/systems/:systemId', async (req, res) => {

    try {

      const { systemId } = req.params

      const params = req.body

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

      const response =
        await forgeSvc.createSystemHook(
          token, systemId, params)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // POST /hooks/systems/:systemId/events/:eventId
  // Create Event Hook
  //
  /////////////////////////////////////////////////////////
  router.post('/systems/:systemId/events/:eventId',
    async (req, res) => {

    try {

      const { systemId, eventId } = req.params

      const params = req.body

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

      const response =
        await forgeSvc.createEventHook(
          token, systemId, eventId, params)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // DELETE /hooks/systems/:systemId/events/:eventId/:hookId
  // Delete Hook
  //
  /////////////////////////////////////////////////////////
  router.delete('/systems/:systemId/events/:eventId/:hookId',
    async (req, res) => {

    try {

      const { systemId, eventId, hookId } = req.params

      const forgeSvc =
        ServiceManager.getService(
          'ForgeSvc')

      const token =
        await forgeSvc.get3LeggedTokenMaster(
          req.session)

      const response =
        await forgeSvc.removeHook(
          token, systemId, eventId, hookId)

      res.json(response)

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  return router
}
