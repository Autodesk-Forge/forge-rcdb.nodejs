import ServiceManager from '../services/SvcManager'
import express from 'express'
import config from 'c0nfig'

export default function () {
  /// //////////////////////////////////////////////////////
  // router
  //
  /// //////////////////////////////////////////////////////
  const router = express.Router()

  /// //////////////////////////////////////////////////////
  // Get user active models
  //
  /// //////////////////////////////////////////////////////
  router.get('/:db/models', async (req, res) => {
    try {
      const db = req.params.db

      const userSvc = ServiceManager.getService(
        'UserSvc')

      const user = await userSvc.getCurrentUser(
        req.session)

      if (!user) {
        res.status(401)
        return res.json('Unauthorized')
      }

      const models =
        await userSvc.getActiveModels(
          config.database.models[db].collection,
          user.userId)

      res.json(models)
    } catch (error) {
      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  return router
}
