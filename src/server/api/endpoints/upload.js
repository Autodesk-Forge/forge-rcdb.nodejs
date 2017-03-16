
import ServiceManager from '../services/SvcManager'
import { serverConfig as config } from 'c0nfig'
import express from 'express'
import multer from 'multer'
import crypto from 'crypto'
import rimraf from 'rimraf'
import path from 'path'
import fs from 'fs'

module.exports = function() {

  var router = express.Router()

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

  ///////////////////////////////////////////////////////////////////
  // start cleanup task to remove uploaded temp files
  //
  ///////////////////////////////////////////////////////////////////
  const dir = path.resolve(__dirname,
    `../../../../TMP`)

  setInterval(() => {

    clean(dir, 60 * 60 * 1000)

  }, 60 * 60 * 1000)

  setTimeout(() => {
    //clean(dir)
  }, 30 * 1000)

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
        'ForgeSvc')

      var token = await forgeSvc.get2LeggedToken()

      var ossSvc = ServiceManager.getService('OssSvc')

      var response = await ossSvc.uploadObject(
        token, bucketKey, objectKey, file)

      res.json(response)

    } catch (ex) {

      console.log(ex)

      res.status(ex.status || 500)
      res.json(ex)
    }
  })

  return router
}

/////////////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////////////
function clean(dir, age = 0) {

  fs.readdir(dir, (err, files) => {

    if(err) {
      return console.error(err)
    }

    files.forEach((file) => {
      const filePath = path.join(dir, file)
      fs.stat(filePath, (err, stat) => {
        if (err) {
          return console.error(err)
        }
        const now = new Date().getTime();
        const endTime = new Date(stat.ctime).getTime() + age
        if (now > endTime) {
          return rimraf(filePath, (err) => {
            if (err) {
              return console.error(err);
            }
            console.log(`${dir} cleaned`);
          })
        }
      })
    })
  })
}
