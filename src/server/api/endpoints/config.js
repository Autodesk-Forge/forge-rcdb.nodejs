import ServiceManager from '../services/SvcManager'
import compression from 'compression'
import express from 'express'
import Debug from 'debug'

module.exports = function() {

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
  // return sequences
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId/sequences',
    async(req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const response =
        await modelSvc.getConfigSequences(
          req.params.modelId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // add sequence
  //
  /////////////////////////////////////////////////////////
  router.post('/:db/:modelId/sequences',
    async(req, res) => {

    try {

      const db = req.params.db

      const sequence = req.body.sequence

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const response =
        await modelSvc.addConfigSequence (
          req.params.modelId,
          sequence)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // update sequence
  //
  /////////////////////////////////////////////////////////
  router.put('/:db/:modelId/sequences',
    async(req, res) => {

    try {

      const db = req.params.db

      const sequence = req.body.sequence

      const modelSvc = ServiceManager.getService (
        db + '-ModelSvc')

      const response =
        await modelSvc.updateConfigSequence (
        req.params.modelId,
        sequence)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // delete sequence
  //
  /////////////////////////////////////////////////////////
  router.delete('/:db/:modelId/sequences/:sequenceId',
    async(req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService (
        db + '-ModelSvc')

      const response =
        await modelSvc.deleteConfigSequence (
          req.params.modelId,
          req.params.sequenceId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // get states from specific sequence
  //
  /////////////////////////////////////////////////////////
  router.get('/:db/:modelId/sequences/:sequenceId/states',
    async(req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService (
        db + '-ModelSvc')

      const response =
        await modelSvc.getConfigSequenceStates (
          req.params.modelId,
          req.params.sequenceId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // add state to specific sequence.
  // body.state can be a single state or an array of states
  //
  /////////////////////////////////////////////////////////
  router.post('/:db/:modelId/sequences/:sequenceId/states',
    async(req, res)=> {

    try {

      const db = req.params.db

      const state = req.body.state

      const modelSvc = ServiceManager.getService (
        db + '-ModelSvc')

      const response =
        await modelSvc.addConfigSequenceStates (
          req.params.modelId,
          req.params.sequenceId,
          state)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  /////////////////////////////////////////////////////////
  // delete sequence state
  //
  /////////////////////////////////////////////////////////
  router.delete(
    '/:db/:modelId/sequences/:sequenceId/states/:stateId',
    async(req, res) => {

    try {

      const db = req.params.db

      const modelSvc = ServiceManager.getService(
        db + '-ModelSvc')

      const response =
        await modelSvc.deleteConfigSequenceState(
        req.params.modelId,
        req.params.sequenceId,
        req.params.stateId)

      res.json(response)

    } catch (error) {

      res.status(error.statusCode || 500)
      res.json(error)
    }
  })

  return router
}
