import ServiceManager from '../services/SvcManager'
import express from 'express'
import Debug from 'debug'

module.exports = function() {

  var router = express.Router()

  var debug = Debug('ModelAPI')

  //////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.get('/:db', async (req, res)=> {

    try {

      var db = req.params.db

      var modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      var opts = {
        fieldQuery:{
          $or: [
            { private: false },
            { private: null }
          ]
        },
        pageQuery: {
          name: 1,
          urn: 1,
          env: 1
        }
      }

      if(req.query.skip)
        opts.pageQuery.skip = req.query.skip

      if(req.query.limit)
        opts.pageQuery.limit = req.query.limit

      var response = await modelSvc.getModels(opts)

      res.json(response)
    }
    catch (error) {

      res.status(error.statusCode || 404)
      res.json(error)
    }
  })

  //////////////////////////////////////////////////////////////////////////////
  // get thumbnails batch mode
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.post('/:db/thumbnails', async(req, res)=> {

    try {

      var db = req.params.db

      var modelSvc = ServiceManager.getService(
        db + '-ModelSvc');

      var modelIds = req.body

      var response = await modelSvc.getThumbnails(
        modelIds)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 404)
      res.json(error)
    }
  })

  //////////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.get('/:db/:modelId', async (req, res)=> {

    try {

      var db = req.params.db

      var modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      var pageQuery = {

      }

      var response = await modelSvc.getById(
        req.params.modelId,
        {pageQuery})

      res.json(response)

    } catch (error) {

      debug(error)

      res.status(error.statusCode || 404)
      res.json(error)
    }
  })

  //////////////////////////////////////////////////////////////////////////////
  // return states sequence
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.get('/:db/:modelId/states/sequence', async(req, res)=> {

    try {

      var db = req.params.db

      var modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      var response = await modelSvc.getSequence(
        req.params.modelId)

      res.json(response)

    } catch (error) {

      debug(error)

      res.status(error.statusCode || 404)
      res.json(error)
    }
  })

  //////////////////////////////////////////////////////////////////////////////
  // save states sequence
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.post('/:db/:modelId/states/sequence', async(req, res)=> {

    try {

      var db = req.params.db

      var modelSvc = ServiceManager.getService(
        db + '-ModelSvc');

      var sequence = req.body.sequence

      var response = await modelSvc.setSequence(
        req.params.modelId,
        sequence)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 404)
      res.json(error)
    }
  })

  //////////////////////////////////////////////////////////////////////////////
  // return all states
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.get('/:db/:modelId/states', async(req, res)=> {

    try {

      var db = req.params.db

      var modelSvc = ServiceManager.getService(
        db + '-ModelSvc');

      var response = await modelSvc.getStates(
        req.params.modelId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 404)
      res.json(error)
    }
  })

  //////////////////////////////////////////////////////////////////////////////
  // remove state
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.post('/:db/:modelId/states/:stateId/remove', async(req, res)=> {

    try {

      var db = req.params.db

      var modelSvc = ServiceManager.getService(
        db + '-ModelSvc');

      var response = await modelSvc.removeState(
        req.params.modelId,
        req.params.stateId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 404)
      res.json(error)
    }
  })

  //////////////////////////////////////////////////////////////////////////////
  // adds new state
  //
  ///////////////////////////////////////////////////////////////////////////////
  router.post('/:db/:modelId/states', async(req, res)=> {

    try {

      var db = req.params.db

      var modelSvc = ServiceManager.getService(
        db + '-ModelSvc');

      var state = req.body.state

      var response = await modelSvc.addState(
        req.params.modelId,
        state)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 404)
      res.json(error)
    }
  })

  return router
}
