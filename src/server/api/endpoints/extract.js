
import ServiceManager from '../services/SvcManager'
import express from 'express'
import config from 'c0nfig'
import rmdir from 'rmdir'
import mzfs from 'mz/fs'
import path from 'path'

module.exports = function() {

  const router = express.Router()

  /////////////////////////////////////////////////////////
  // POST /
  //
  /////////////////////////////////////////////////////////
  router.post('/:modelId', async (req, res) => {

    try {

      const modelId = req.params.modelId

      // supports extraction only for gallery models
      const modelSvc = ServiceManager.getService(
        'gallery-ModelSvc')

      const dbModel = await modelSvc.getById(modelId)

      res.json('processing')

      // name model to download
      const name = dbModel.name

      // URN of model to download
      const urn = dbModel.model.urn

      // Get Forge service
      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      // getToken async function
      const getToken = () => forgeSvc.get2LeggedToken()

      // Get Extractor service
      const extractorSvc = ServiceManager.getService(
        'ExtractorSvc')

      // target path to download SVF
      const dir = path.resolve(__dirname,
        `../../../../TMP/${modelId}`)

      // perform download
      const files = await extractorSvc.download(
        getToken, urn, dir)

      // target zipfile
      const zipfile = dir + '.zip'

      // zip all files
      await extractorSvc.createZip(
        dir, zipfile + '.tmp', name, files)

      mzfs.rename(zipfile + '.tmp', zipfile)

      // remove downloaded resources directory
      rmdir(dir)

      if (req.body.socketId) {

        const socketSvc = ServiceManager.getService(
          'SocketSvc')

        const msg = {
          modelId
        }

        socketSvc.broadcast(
          'extract.ready', msg, req.body.socketId)
      }

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /status/:name
  //
  /////////////////////////////////////////////////////////
  router.get('/status/:modelId', async (req, res) => {

    try {

      const modelId = req.params.modelId

      const filename = path.resolve(__dirname,
        `../../../../TMP/${modelId}.zip`)

      await mzfs.stat(filename)

      res.json('ok')

    } catch (ex) {

      res.status(404)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /download/:name
  //
  /////////////////////////////////////////////////////////
  router.get('/download/:modelId', async (req, res) => {

    try {

      const modelId = req.params.modelId

      const modelSvc = ServiceManager.getService(
        'gallery-ModelSvc')

      const dbModel = await modelSvc.getById(modelId)

      const name = dbModel.name

      const filename = path.resolve(__dirname,
        `../../../../TMP/${modelId}.zip`)

      await mzfs.stat(filename)

      res.download(filename, `${name}.zip`)

    } catch (ex) {

      res.status(404)
      res.json(ex)
    }
  })

  return router
}
