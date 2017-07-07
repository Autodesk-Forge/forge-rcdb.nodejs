import BaseSvc from './BaseSvc'
import multer from 'multer'
import crypto from 'crypto'
import rimraf from 'rimraf'
import path from 'path'
import fs from 'fs'

export default class UploadSvc extends BaseSvc {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor(config) {

    super(config)

    // Initialize upload
    const storage = multer.diskStorage({

      destination: config.tempStorage,
      filename: (req, file, cb) => {
        crypto.pseudoRandomBytes(16, (err, raw) => {
          if (err) return cb(err)
          cb(null, raw.toString('hex') + path.extname(
            file.originalname))
        })
      }
    })

    this.multer = multer({storage: storage})

    // start cleanup task to remove uploaded temp files
    setInterval(() => {
      this.clean(config.tempStorage, 60 * 60)
    }, 1000 * 60 * 60)

    setTimeout(() => {
      this.clean(config.tempStorage)
    }, 5 * 1000)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  name() {

    return 'UploadSvc'
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  get uploader () {

    return this.multer
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  clean (dir, maxAge = 0) {

    console.log(`Cleaning Dir: ${dir}`)

    fs.readdir(dir, (err, files) => {

      if (err) {
        return console.error(err)
      }

      files.forEach((file) => {

        const filePath = path.join(dir, file)

        fs.stat(filePath, (err, stat) => {

          if (err) {
            return console.error(err)
          }

          const now = new Date()

          const age = (now - new Date(stat.ctime)) / 1000

          if (age > maxAge) {

            return rimraf(filePath, (err) => {

              if (err) {
                return console.error(err);
              }
            })
          }
        })
      })
    })
  }
}

