
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import findRemoveSync from 'find-remove'
import express from 'express'
import multer from 'multer'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

module.exports = function() {

  var router = express.Router()

  //clean up TMP files at startup
  findRemoveSync('TMP', {
    age: { seconds: 0 }
  })

  ///////////////////////////////////////////////////////////////////
  // start cleanup task to remove uploaded temp files
  //
  ///////////////////////////////////////////////////////////////////
  setInterval(() => {

    findRemoveSync('TMP', {
      age: { seconds: 3600 }
    }), 60 * 60 * 1000
  })

  //////////////////////////////////////////////////////////////////////////////
  // Initialization upload
  //
  ///////////////////////////////////////////////////////////////////////////////
  var storage = multer.diskStorage({

    destination: 'TMP/',
    filename: function (req, file, cb) {
      crypto.pseudoRandomBytes(16, function (err, raw) {
        if (err) return cb(err)
        cb(null, raw.toString('hex') + path.extname(file.originalname))
      })
    }
  })

  var upload = multer({ storage: storage })

  /////////////////////////////////////////////////////////////////////////////
  // POST /upload/oss/:bucketKey
  //
  /////////////////////////////////////////////////////////////////////////////
  router.post('/oss/:bucketKey', upload.any(), async (req, res) => {

    try {

      var bucketKey = req.params.bucketKey

      var file = req.files[0]

      var objectKey = file.originalname

      var forgeSvc = ServiceManager.getService(
        'ForgeSvc');

      var token = await forgeSvc.get2LeggedToken()

      var ossSvc = ServiceManager.getService('OssSvc')

      var response = await ossSvc.putObject(
        token.access_token,
        bucketKey,
        objectKey,
        file)

      res.json(response)
    }
    catch (ex) {

      console.log(ex)

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  return router
}