
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
  router.post('/', async (req, res) => {

    try {

      const payload = JSON.parse(req.body.payload)

      const name = payload.name

      const urn = payload.urn

      const forgeSvc = ServiceManager.getService(
        'ForgeSvc')

      const getToken = () => forgeSvc.get2LeggedToken()

      const extractorSvc = ServiceManager.getService(
        'ExtractorSvc')

      const dir = path.resolve(__dirname,
        `../../../../TMP/${name}`)

      const files = await extractorSvc.download(
        getToken, payload.urn, dir)

      const zipfile = dir + '.zip'

      await extractorSvc.createZip(
        dir, zipfile + '.tmp', name, files)

      mzfs.rename(zipfile + '.tmp', zipfile)

      rmdir(dir)

      res.json('done')

    } catch (ex) {

      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  /////////////////////////////////////////////////////////
  // GET /status/:name
  //
  /////////////////////////////////////////////////////////
  router.get('/status/:name', async (req, res) => {

    try {

      const name = req.params.name

      const filename = path.resolve(__dirname,
        `../../../../TMP/${name}.zip`)

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
  router.get('/download/:name', async (req, res) => {

    try {

      const name = req.params.name

      const filename = path.resolve(__dirname,
        `../../../../TMP/${name}.zip`)

      await mzfs.stat(filename)

      res.download(filename)

    } catch (ex) {

      res.status(404)
      res.json(ex)
    }
  })

  return router
}
